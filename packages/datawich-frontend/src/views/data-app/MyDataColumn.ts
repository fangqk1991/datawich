import {
  Component,
  InfoCell,
  InformationDialog,
  MyRichTextPanel,
  MySelect,
  MyTagsPanel,
  Prop,
  ViewController,
} from '@fangcha/vue'
import { FieldType, ModelFieldModel } from '@fangcha/datawich-service'
import { TemplateHelper } from '@fangcha/tools'
import {
  DataColumnExtension,
  FieldPluginCenter,
  MultiEnumContainer,
  PluginDataColumn,
  TagsContainer,
} from '@fangcha/datawich-frontend'
import { GeneralDataHelper } from '@fangcha/datawich-service'

@Component({
  components: {
    'my-select': MySelect,
    'tags-container': TagsContainer,
    'my-tags-panel': MyTagsPanel,
    'multi-enum-container': MultiEnumContainer,
    'data-column-extension': DataColumnExtension,
    'my-rich-text-panel': MyRichTextPanel,
    'plugin-data-column': PluginDataColumn,
  },
  template: `
    <plugin-data-column
      v-if="fieldPlugin"
      :column-view="fieldPlugin.columnView"
      :field="field"
      :super-field="superField"
      :filter-options="filterOptions"
      @on-filter-change="onFilterUpdate"
    />
    <el-table-column
      v-else-if="field.fieldType === FieldType.Enum || field.fieldType === FieldType.TextEnum"
      :prop="filterKey"
    >
      <template v-slot:header>
        <my-select v-model="filterOptions[filterKey]" @change="onFilterUpdate">
          <option value="">{{ field.name }}</option>
          <option v-for="option in getOptionsForEnumField()" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </my-select>
      </template>
      <template slot-scope="scope">
        <my-select
          v-if="field.useEnumSelector"
          v-loading="isLoading"
          v-model="scope.row[dataKey]"
          @change="onUpdateEnumValue(scope.row)"
        >
          <option value="">{{ field.name }}</option>
          <option v-for="option in getOptionsForEnumField(scope.row)" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </my-select>
        <template v-else>
          {{ field.value2LabelMap[scope.row[dataKey]] }}
        </template>
        <data-column-extension :super-field="superField" :field="field" :data="scope.row" />
      </template>
    </el-table-column>
    <el-table-column v-else-if="field.fieldType === FieldType.MultiEnum" :prop="filterKey">
      <template v-slot:header>
        <el-popover placement="bottom" width="200" trigger="click">
          <el-checkbox
            v-for="item in field.options"
            :key="item.value"
            v-model="tagCheckedMap[item.value]"
            :label="item.value"
            class="mr-3"
            @change="onTagsPickerChanged()"
          >
            {{ item.label }}
          </el-checkbox>
          <a slot="reference" href="javascript:">
            <template v-if="filterOptions[filterKey]">
              {{ getTagsHeader() }}
            </template>
            <template v-else>
              {{ field.name }}
            </template>
          </a>
        </el-popover>
      </template>
      <template slot-scope="scope">
        <multi-enum-container :options="field.options" :value="scope.row[dataKey]" />
        <data-column-extension :super-field="superField" :field="field" :data="scope.row" />
      </template>
    </el-table-column>
    <el-table-column
      v-else-if="field.fieldType === FieldType.MultipleLinesText"
      :label="field.name"
      :prop="filterKey"
      show-overflow-tooltip
    >
      <template slot-scope="scope">
        <div v-html="getMultipleTextHtml(scope.row[dataKey])" />
        <data-column-extension :super-field="superField" :field="field" :data="scope.row" />
      </template>
    </el-table-column>
    <el-table-column
      v-else-if="field.fieldType === FieldType.RichText"
      :prop="filterKey"
      :label="field.name"
      show-overflow-tooltip
    >
      <template slot-scope="scope">
        <my-rich-text-panel :html-content="scope.row[dataKey]" />
        <data-column-extension :super-field="superField" :field="field" :prop="filterKey" :data="scope.row" />
      </template>
    </el-table-column>
    <el-table-column v-else-if="field.fieldType === FieldType.Template" :prop="filterKey" :label="field.name">
      <template slot-scope="scope">
        {{ renderContentTmpl(scope.row) }}
      </template>
    </el-table-column>
    <el-table-column v-else-if="field.fieldType === FieldType.Group" :prop="filterKey" :label="field.name">
      <template slot-scope="scope">
        {{ renderContentTmpl(scope.row) }}
        <a href="javascript:" @click="onViewGroup(scope.row)"> 点击查看 </a>
      </template>
    </el-table-column>
    <el-table-column v-else-if="field.fieldType === FieldType.Datetime" :label="field.name" :prop="filterKey" sortable>
      <template slot-scope="scope">
        {{ scope.row[dataKey] | ISO8601 }}
        <data-column-extension :super-field="superField" :field="field" :data="scope.row" />
      </template>
    </el-table-column>
    <el-table-column v-else-if="field.fieldType === FieldType.Link" :prop="filterKey" :label="field.name">
      <template slot-scope="scope">
        <a v-if="scope.row[dataKey]" :href="scope.row[dataKey]" target="_blank">
          <el-tag class="adaptive-tag" type="danger"><i class="el-icon-connection" /> Link</el-tag>
        </a>
        <data-column-extension :super-field="superField" :field="field" :data="scope.row" />
      </template>
    </el-table-column>
    <el-table-column v-else-if="field.fieldType === FieldType.StringList" :prop="filterKey" :label="field.name">
      <template slot-scope="scope">
        <my-tags-panel v-if="scope.row[dataKey]" :values="scope.row[dataKey]" />
        <data-column-extension :super-field="superField" :field="field" :data="scope.row" />
      </template>
    </el-table-column>
    <el-table-column v-else :label="field.name" :prop="filterKey" sortable>
      <template slot-scope="scope">
        {{ scope.row[dataKey] }}
        <data-column-extension :super-field="superField" :field="field" :data="scope.row" />
      </template>
    </el-table-column>
  `,
})
export class MyDataColumn extends ViewController {
  @Prop({ default: undefined, type: Object }) readonly superField!: ModelFieldModel | undefined
  @Prop({ default: null, type: Object }) readonly field!: ModelFieldModel
  @Prop({
    default: () => {
      return {}
    },
    type: Object,
  })
  readonly filterOptions!: any
  @Prop({
    default: () => {
      return {}
    },
    type: Object,
  })
  readonly tagCheckedMap!: any

  FieldType = FieldType
  viewDidLoad() {
    this.$set(this.filterOptions, this.filterKey, this.filterOptions[this.filterKey])
  }

  get filterKey() {
    return this.field.filterKey
  }

  get dataKey() {
    return GeneralDataHelper.calculateDataKey(this.field, this.superField)
  }

  get fieldPlugin() {
    return FieldPluginCenter.getFieldPlugin(this.field)
  }

  onViewGroup(data: any) {
    const infos: InfoCell[] = this.field.groupFields.map((field) => {
      const dataKey = GeneralDataHelper.calculateDataKey(field)
      return {
        label: field.name,
        value: data[dataKey],
      }
    })
    InformationDialog.show(`${this.field.name} 相关信息`, infos)
  }

  getMultipleTextHtml(content: string) {
    return `${content}`.replace(/\n/g, '<br />')
  }

  getTagsHeader() {
    return GeneralDataHelper.getCheckedTagsForField(this.field, this.tagCheckedMap).join(', ')
  }

  onTagsPickerChanged() {
    if (this.field.fieldType === FieldType.MultiEnum) {
      this.filterOptions[this.filterKey] = GeneralDataHelper.calculateMultiEnumValueWithCheckedMap(this.tagCheckedMap)
    } else {
      this.filterOptions[this.filterKey] = GeneralDataHelper.calculateValueWithCheckedMap(this.tagCheckedMap)
    }
    this.onFilterUpdate()
  }

  getOptionsForEnumField(data?: any) {
    const field = this.field
    let options = field.options || []
    if (field.constraintKey) {
      const constraintKey = data
        ? GeneralDataHelper.calculateDataKey({
            fieldKey: field.constraintKey,
            modelKey: field.modelKey,
          })
        : GeneralDataHelper.calculateFilterKey({
            fieldKey: field.constraintKey,
            modelKey: field.modelKey,
          })
      const constraintValue = data ? data[constraintKey] : this.filterOptions[constraintKey]
      if (constraintValue) {
        options = options.filter((option) => {
          const restraintValueMap = option['restraintValueMap'] || {}
          return !!restraintValueMap[constraintValue]
        })
      }
    }
    return options
  }

  onFilterUpdate() {
    this.$emit('on-filter-change', this.filterOptions)
  }

  renderContentTmpl(data: any) {
    return TemplateHelper.renderTmpl(this.field.fieldDisplayTmpl, data)
  }

  async onUpdateEnumValue(_data: any) {
    // await GeneralDataManager.do.updateDataAppRecord(this.field.modelKey, data._data_id, {
    //   [this.field.fieldKey]: data[this.dataKey],
    // })
    // this.$message.success('修改成功')
  }
}

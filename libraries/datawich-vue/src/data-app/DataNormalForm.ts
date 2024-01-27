import { Component } from 'vue-property-decorator'
import { FieldType, ModelFieldModel } from '@fangcha/datawich-service'
import * as moment from 'moment'
import { i18n, MyDatetimePicker, Prop, ViewController, Watch, StringListPanel } from '@fangcha/vue'
import { RichTextEditor } from '@fangcha/vue/rich-text-editor'
import { I18nCode, SelectOption } from '@fangcha/tools'
import { FieldPluginCenter, PluginFormItem } from '../core'
import { GeneralDataChecker, GeneralDataHelper } from '@fangcha/datawich-service'
import { LogicExpression, LogicExpressionHelper } from '@fangcha/logic'

const _getCalcDate = (dateDesc: string) => {
  if (dateDesc) {
    const matches = dateDesc.match(/^([+-])(\d+)d$/)
    if (matches) {
      const flag = matches[1]
      const daysDiff = Number(matches[2])
      if (flag === '+') {
        return moment().add(daysDiff, 'days').format('YYYY-MM-DD')
      } else if (flag === '-') {
        return moment().subtract(daysDiff, 'days').format('YYYY-MM-DD')
      }
    } else {
      return moment(dateDesc).format('YYYY-MM-DD')
    }
  }
  return ''
}

@Component({
  components: {
    'rich-text-editor': RichTextEditor,
    'my-datetime-picker': MyDatetimePicker,
    'plugin-form-item': PluginFormItem,
    'string-list-panel': StringListPanel,
  },
  template: `
    <el-form label-width="160px" @submit.native.prevent="onEnter">
      <slot />
      <el-form-item
        v-for="field in visibleFields"
        :key="field.fieldKey"
        :required="!!field.required"
        size="mini"
        :style="{ 'margin-bottom': '8px' }"
      >
        <span v-if="errorMap[field.fieldKey]" class="text-danger" slot="label">
          {{ nameForField(field) }}
          <el-tooltip class="item" effect="dark" placement="top" :content="errorMap[field.fieldKey]">
            <span class="el-icon-question" />
          </el-tooltip>
        </span>
        <span v-else slot="label">
          {{ nameForField(field) }}
          <el-tooltip v-if="field.extrasData.readonly" class="item" effect="dark" placement="top" content="Readonly">
            <span class="el-icon-question" />
          </el-tooltip>
        </span>
        <template v-if="field.fieldType === FieldType.TextEnum">
          <el-select
            v-if="field.options.length > 5"
            v-model="myData[field.fieldKey]"
            :disabled="!checkFieldEditable(field)"
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="option in optionsForEnumField(field)"
              :key="option.value"
              :label="getOptionLabel(option)"
              :value="option.value"
            />
          </el-select>
          <el-radio-group v-else v-model="myData[field.fieldKey]" :disabled="!checkFieldEditable(field)">
            <el-radio-button v-for="item in optionsForEnumField(field)" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </template>
        <div v-if="field.fieldType === FieldType.MultiEnum && multiEnumCheckedMap[field.fieldKey]">
          <el-checkbox
            v-for="item in field.options"
            :key="item.value"
            v-model="multiEnumCheckedMap[field.fieldKey][item.value]"
            :label="item.value"
            class="mr-3"
            :disabled="!checkFieldEditable(field)"
          >
            {{ item.label }}
          </el-checkbox>
        </div>
        <div v-if="field.fieldType === FieldType.StringList">
          <string-list-panel v-model="myData[field.fieldKey]" />
        </div>
        <template v-if="checkFieldTextWidget(field)">
          <el-autocomplete
            v-if="searchFuncMap[field.fieldKey]"
            v-model="myData[field.fieldKey]"
            style="width: 100%;"
            :fetch-suggestions="searchFuncMap[field.fieldKey]"
            :trigger-on-focus="true"
            :disabled="!checkFieldEditable(field)"
            @select="onSearchItemPicked"
          />
          <el-input
            v-else
            v-model="myData[field.fieldKey]"
            type="text"
            style="width: 200px;"
            :disabled="!checkFieldEditable(field)"
          />
        </template>
        <template v-if="checkFieldNumberWidget(field)">
          <el-select
            v-if="searchItemMap[field.fieldKey]"
            v-model="myData[field.fieldKey]"
            style="width: 100%"
            :remote-method="searchItemMap[field.fieldKey].func"
            remote
            filterable
          >
            <el-option
              v-for="item in searchItemMap[field.fieldKey].options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-input v-else v-model="myData[field.fieldKey]" type="number" :disabled="!checkFieldEditable(field)">
          </el-input>
        </template>
        <el-input
          v-if="field.fieldType === FieldType.MultipleLinesText || field.fieldType === FieldType.Link"
          v-model="myData[field.fieldKey]"
          :rows="3"
          type="textarea"
          :disabled="!checkFieldEditable(field)"
        />
        <el-input
          v-if="field.fieldType === FieldType.JSON"
          v-model="myData[field.fieldKey]"
          :rows="3"
          type="textarea"
          :disabled="!checkFieldEditable(field)"
        />
        <rich-text-editor
          v-if="field.fieldType === FieldType.RichText"
          v-model="myData[field.fieldKey]"
          placeholder=" "
          :disabled="!checkFieldEditable(field)"
        />
        <el-date-picker
          v-if="field.fieldType === FieldType.Date"
          v-model="myData[field.fieldKey]"
          type="date"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          style="width:200px"
          :picker-options="getPickerOptions(field)"
          :disabled="!checkFieldEditable(field)"
        />
        <my-datetime-picker
          v-if="field.fieldType === FieldType.Datetime"
          v-model="myData[field.fieldKey]"
          style="width:200px"
          :picker-options="getPickerOptions(field)"
          :disabled="!checkFieldEditable(field)"
        />
        <plugin-form-item
          v-if="fieldPlugin(field)"
          :form-item-view="fieldPlugin(field).formItemView"
          :field="field"
          :my-data="myData"
          :readonly="readonly"
          :force-editing="forceEditing"
        />
      </el-form-item>
    </el-form>
  `,
})
export class DataNormalForm extends ViewController {
  @Prop({
    default: () => {
      return {}
    },
    type: Object,
  })
  readonly myData!: any
  @Prop({ default: () => [], type: Array }) readonly allFields!: ModelFieldModel[]
  @Prop({ default: '', type: String }) readonly modelKey!: string
  @Prop({ default: false, type: Boolean }) readonly readonly!: boolean
  @Prop({ default: false, type: Boolean }) readonly forceEditing!: boolean

  FieldType = FieldType
  pickerOptionsMap: any = {}

  multiEnumCheckedMap: any = {}
  searchFuncMap: { [p: string]: Function } = {}
  searchItemMap: {
    [p: string]: {
      func: Function
      options: SelectOption[]
    }
  } = {}

  visibleLogicMap: { [fieldKey: string]: LogicExpression } = {}

  constructor() {
    super()
  }

  fieldPlugin(field: ModelFieldModel) {
    return FieldPluginCenter.getFieldPlugin(field)
  }

  checkFieldEditable(field: ModelFieldModel) {
    if (this.readonly) {
      return false
    }
    if (this.forceEditing) {
      return true
    }
    return !field.extrasData.readonly
  }

  optionsForEnumField(field: ModelFieldModel) {
    let options = field.options
    if (field.extrasData.constraintKey) {
      const constraintValue = this.myData[field.extrasData.constraintKey] || ''
      options = options.filter((option) => {
        const restraintValueMap = option['restraintValueMap'] || {}
        return !!restraintValueMap[constraintValue]
      })
    }
    return options
  }

  @Watch('allFields')
  onModelKeyChanged() {
    this.onFieldsChanged()
  }

  get visibleFields() {
    return this.allFields.filter((field) => {
      if (this.visibleLogicMap[field.fieldKey]) {
        return LogicExpressionHelper.calcExpression(this.visibleLogicMap[field.fieldKey], this.myData)
      }
      return true
    })
  }

  onFieldsChanged() {
    const fields = this.allFields
    {
      const visibleLogicMap: { [fieldKey: string]: LogicExpression } = {}
      fields.forEach((field) => {
        if (field.extrasData.visibleLogic) {
          visibleLogicMap[field.fieldKey] = field.extrasData.visibleLogic
        }
      })
      this.visibleLogicMap = visibleLogicMap
    }
    {
      const pickerOptionsMap = {}
      fields
        .filter((field) => field.fieldType === FieldType.Date || field.fieldType === FieldType.Datetime)
        .forEach((field) => {
          const dateRange = field.extrasData.dateRange
          if (dateRange) {
            const floorDate = moment(_getCalcDate(dateRange.floor))
            const ceilDate = moment(_getCalcDate(dateRange.ceil))
            pickerOptionsMap[field.fieldKey] = {
              disabledDate(time: Date) {
                if (time.getTime() < floorDate.valueOf()) {
                  return true
                }
                if (time.getTime() > ceilDate.valueOf()) {
                  return true
                }
                return false
              },
            }
          }
        })
      this.pickerOptionsMap = pickerOptionsMap
    }
    {
      fields
        .filter((field) => field.fieldType === FieldType.MultiEnum)
        .forEach((field) => {
          const checkedMap = GeneralDataHelper.extractMultiEnumCheckedMapForValue(
            this.myData[field.fieldKey],
            field.options
          )
          this.$set(this.multiEnumCheckedMap, field.fieldKey, checkedMap)
        })
    }
    FieldPluginCenter.onFormDataChanged(this, this.myData, fields)
  }

  viewDidLoad() {
    this.onFieldsChanged()
  }

  onSearchItemPicked(data: any) {
    this.myData[data.fieldKey] = data.entity
  }

  checkFieldTextWidget(field: ModelFieldModel) {
    return [FieldType.SingleLineText].includes(field.fieldType as FieldType)
  }

  checkFieldNumberWidget(field: ModelFieldModel) {
    return [FieldType.Float, FieldType.Integer].includes(field.fieldType as FieldType)
  }

  getPickerOptions(field: ModelFieldModel) {
    return this.pickerOptionsMap[field.fieldKey]
  }

  errorMap: { [p: string]: string } = {}
  checkFormDataValid(formData: any) {
    // const formData = cleanDataByModelFields(this.myData, this.allFields)
    const errorMap: { [p: string]: string } = GeneralDataChecker.calcSimpleInvalidMap(
      formData,
      this.allFields.filter((item) => !item.extrasData.readonly)
    )
    this.errorMap = errorMap
    if (Object.keys(errorMap).length > 0) {
      const errorMsg = Object.keys(errorMap)
        .map((errKey) => errorMap[errKey])
        .join('，')
      this.$message.error(errorMsg)
      throw new Error(errorMsg)
    }
  }

  exportResult() {
    const result = { ...this.myData }
    this.allFields
      .filter((field) => field.fieldType === FieldType.MultiEnum)
      .forEach((field) => {
        const checkedMap = this.multiEnumCheckedMap[field.fieldKey]
        result[field.fieldKey] = GeneralDataHelper.calculateMultiEnumValueWithCheckedMap(checkedMap)
      })
    this.allFields
      .filter((field) => field.fieldType === FieldType.Integer)
      .forEach((field) => {
        if (/^-?\d+$/.test(result[field.fieldKey])) {
          result[field.fieldKey] = Number(result[field.fieldKey])
        }
      })
    this.checkFormDataValid(result)
    return result
  }

  getOptionLabel(option: SelectOption) {
    return `${option.value}. ${option.label}`
  }

  nameForField(field: ModelFieldModel) {
    const nameI18n = field.extrasData.nameI18n || {}
    const code = i18n.locale === 'en' ? I18nCode.en : I18nCode.zhHans
    return nameI18n[code] || field.name
  }

  onEnter() {}
}

import { Component } from '@fangcha/vue'
import { FieldType, ModelFieldModel } from '@fangcha/datawich-service/lib/common/models'
import { ModelFieldApis } from '@fangcha/datawich-service/lib/common/web-api'
import EnumFieldExtensionBase from './EnumFieldExtensionBase'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'

interface RestraintInfo {
  pickedField: ModelFieldModel | any
  potentialParentFields: ModelFieldModel[]
}

@Component({
  template: `
    <div class="my-theme">
      <p v-if="data.fieldType === FieldType.Enum">
        <b class="text-danger">用数字表示的「枚举」类型已经不被推荐，推荐使用表达范围更广、可读性更强的「文本枚举」</b>
      </p>
      <el-form-item label="约束字段" :required="false">
        <el-select v-model="data.constraintKey" :disabled="readonly" clearable @change="onRestraintFieldChanged">
          <el-option
            v-for="option in restraintInfo.potentialParentFields"
            :key="option.fieldKey"
            :label="option.name"
            :value="option.fieldKey"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="快速编辑">
        <el-radio-group v-model="data.useEnumSelector">
          <el-radio-button :key="true" :label="true">是</el-radio-button>
          <el-radio-button :key="false" :label="false">否</el-radio-button>
        </el-radio-group>
        <el-tooltip class="item" effect="dark" placement="top">
          <span class="el-icon-question" />
          <div slot="content">
            「快速编辑」指的是在列表页直接用下拉框取代文本展示，以便用户快速操作
          </div>
        </el-tooltip>
      </el-form-item>
      <div class="mx-4">
        <el-table :data="data.options" size="mini" border :header-cell-style="{ 'background-color': '#fafafa' }">
          <template slot="empty">
            <el-button style="color: #4E5BBD; border-color: #4E5BBD;" :disabled="readonly" size="mini" @click="addEnumOption">
              {{ LS('Add') }}
            </el-button>
          </template>
          <el-table-column label="枚举值">
            <template slot-scope="scope">
              <el-input v-model="scope.row.value" :type="isTextEnum ? 'text' : 'number'" size="small" :disabled="readonly || scope.row.already" />
            </template>
          </el-table-column>
          <el-table-column label="枚举名称">
            <template slot-scope="scope">
              <el-input v-model="scope.row.label" size="small" :disabled="readonly" />
            </template>
          </el-table-column>
          <el-table-column v-if="data.constraintKey" label="作用域">
            <template slot-scope="scope">
              <el-checkbox
                v-for="option of restraintInfo.pickedField.options"
                v-model="scope.row.restraintValueMap[option.value]"
                :key="option.value"
                :disabled="readonly"
              >
                {{ option.label }}
              </el-checkbox>
            </template>
          </el-table-column>
          <el-table-column v-if="!readonly" width="120px" align="center">
            <template slot="header">
              <span>{{ LS('Action') }}</span>
            </template>
            <template slot-scope="scope">
              <el-button class="el-icon-plus action-icon" @click="addEnumOption(scope.$index)" />
              <el-button class="el-icon-delete action-icon" @click="removeEnumOption(scope.$index)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  `,
})
export default class EnumFieldExtension extends EnumFieldExtensionBase {
  FieldType = FieldType

  restraintInfo: RestraintInfo = {
    pickedField: {
      options: [],
    },
    potentialParentFields: [],
  }

  viewDidLoad() {
    this.loadPotentialParentFields().then(() => {
      this.onRestraintFieldChanged()
    })
  }

  get isTextEnum() {
    return this.data.fieldType === FieldType.TextEnum
  }

  async loadPotentialParentFields() {
    const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelVisibleFieldListGet, this.modelKey))
    const fields = (await request.quickSend()) as ModelFieldModel[]
    this.restraintInfo.potentialParentFields = fields.filter((field) => {
      return field.fieldType === FieldType.Enum || field.fieldType === FieldType.TextEnum
    })
  }

  async onRestraintFieldChanged() {
    const field = this.restraintInfo.potentialParentFields.find((field) => {
      return field.fieldKey === this.data.constraintKey
    })
    if (field) {
      this.restraintInfo.pickedField = field
    } else {
      this.restraintInfo.pickedField = {
        options: [],
      }
    }
  }
}

import { Component } from 'vue-property-decorator'
import { TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import { DataModelModel, FieldType, ModelFieldModel } from '@fangcha/datawich-service/lib/common/models'
import { DataModelApis, ModelFieldApis } from '@fangcha/datawich-service/lib/common/web-api'
import { SelectOption } from '@fangcha/tools'
import EnumFieldExtension from './EnumFieldExtension'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
    'enum-field-extension': EnumFieldExtension,
  },
  template: `
    <typical-dialog-view :title="title" width="60%" :callback="callback">
      <el-form class="my-mini-form" label-width="120px" size="mini">
        <el-form-item label="字段 Key" :required="true">
          <el-input v-model="data.fieldKey" type="text" style="width: 200px;" :disabled="forEditing" />
        </el-form-item>
        <el-form-item label="字段名称" :required="true">
          <el-input v-model="data.name" type="text" style="width: 200px;" />
        </el-form-item>
        <el-form-item label="连接模型" :required="true">
          <el-select v-model="matrixField.modelKey" :disabled="forEditing" @change="onMasterModelChanged">
            <el-option
              v-for="option in contentModelOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="连接字段" :required="true">
          <el-select v-model="matrixField.fieldKey" :disabled="forEditing">
            <el-option
              v-for="option in contentFieldOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <enum-field-extension
          v-if="isEnumType"
          :data="fieldMap[matrixField.fieldKey]"
          :model-key="modelKey"
          readonly
        />
      </el-form>
    </typical-dialog-view>
  `,
})
export default class ShadowFieldDialog extends TypicalDialog {
  modelKey: string = ''
  forEditing = false

  get isEnumType() {
    const field = this.fieldMap[this.matrixField.fieldKey]
    return field && [FieldType.Enum, FieldType.TextEnum].includes(field.fieldType as any)
  }

  data: ModelFieldModel | any = {
    fieldKey: '',
    name: '',
    star: 0,
    matrixKey: '',
  }

  matrixField = {
    modelKey: '',
    fieldKey: '',
  }

  contentModelOptions: SelectOption[] = []
  contentFieldOptions: SelectOption[] = []
  fieldMap: { [p: string]: ModelFieldModel } = {}

  constructor() {
    super()
  }

  viewDidLoad() {
    this.loadContentModels()
    if (this.data.isShadow) {
      const [modelKey, fieldKey] = this.data.matrixKey.split('.')
      this.matrixField.modelKey = modelKey
      this.matrixField.fieldKey = fieldKey
    }
  }

  async loadContentModels() {
    const request = MyAxios(DataModelApis.DataContentModelListGet)
    const contentModels = (await request.quickSend()) as DataModelModel[]
    this.contentModelOptions = contentModels.map((model) => {
      return {
        label: `${model.modelKey} - ${model.name}`,
        value: model.modelKey,
      }
    })
  }

  onMasterModelChanged() {
    this.reloadMasterInfo()
  }

  async reloadMasterInfo() {
    if (!this.matrixField.modelKey) {
      this.matrixField.fieldKey = ''
      this.contentFieldOptions = []
      this.fieldMap = {}
      return
    }
    const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelVisibleFieldListGet, this.matrixField.modelKey))
    const fields = (await request.quickSend()) as ModelFieldModel[]
    const usefulFields = fields.filter(
      (field) => field.fieldType === FieldType.Enum || field.fieldType === FieldType.TextEnum
    )
    this.contentFieldOptions = usefulFields.map((field) => {
      return {
        label: `${field.modelKey} - ${field.name}`,
        value: field.fieldKey,
      }
    })
    this.fieldMap = {}
    for (const field of usefulFields) {
      this.$set(this.fieldMap, field.fieldKey, field)
    }
  }

  static createFieldDialog() {
    const dialog = new ShadowFieldDialog()
    dialog.title = '关联内容字段'
    return dialog
  }

  static editFieldDialog(data: ModelFieldModel) {
    const dialog = new ShadowFieldDialog()
    dialog.title = '关联内容字段'
    dialog.data = JSON.parse(JSON.stringify(data))
    dialog.forEditing = true
    return dialog
  }

  onHandleResult() {
    this.data.matrixKey = `${this.matrixField.modelKey}.${this.matrixField.fieldKey}`
    return this.data
  }
}

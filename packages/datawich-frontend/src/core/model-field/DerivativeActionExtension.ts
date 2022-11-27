import { Component, Prop, ViewController } from '@fangcha/vue'
import { DataModelModel, ModelFieldModel } from '@fangcha/datawich-service/lib/common/models'
import { SelectOption } from '@fangcha/tools'
import { DataModelApis, ModelFieldApis } from '@fangcha/datawich-service/lib/common/web-api'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'

@Component({
  template: `
    <div>
      <el-form-item label="目标模型" :required="true">
        <el-select v-model="derivativeInfo.toModelKey" style="width: 100%;" @change="onReferenceModelChanged">
          <el-option
            v-for="option in openModelOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :required="true">
          <span slot="label">
            <span>目标键</span>
            <el-tooltip class="item" effect="dark" placement="top">
              <span class="el-icon-question" />
              <div slot="content">
                目标键需要具备唯一性，若本字段值能够匹配目标键值，弹框内容则可以加载目标模型对应的记录信息
              </div>
            </el-tooltip>
          </span>
        <el-select v-model="derivativeInfo.toFieldKey" style="width: 100%;">
          <el-option
            v-for="option in openFieldOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
    </div>
  `,
})
export default class DerivativeActionExtension extends ViewController {
  @Prop({
    default: () => {
      return {
        toModelKey: '',
        toFieldKey: '',
      }
    },
    type: Object,
  })
  readonly derivativeInfo!: { toModelKey: string; toFieldKey: string }

  openModelOptions: SelectOption[] = []
  openFieldOptions: SelectOption[] = []

  viewDidLoad() {
    this.loadOpenModels()
    this.reloadReferenceInfo()
  }

  onReferenceModelChanged() {
    this.reloadReferenceInfo()
    this.derivativeInfo.toFieldKey = ''
  }

  async reloadReferenceInfo() {
    if (!this.derivativeInfo.toModelKey) {
      this.derivativeInfo.toFieldKey = ''
      return
    }
    const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelVisibleFieldListGet, this.derivativeInfo.toModelKey))
    const fields = (await request.quickSend()) as ModelFieldModel[]
    const uniqueFields = fields.filter((field) => field.isUnique)
    this.openFieldOptions = uniqueFields.map((field) => {
      return {
        label: `${field.modelKey} - ${field.name}`,
        value: field.fieldKey,
      }
    })
  }

  async loadOpenModels() {
    const request = MyAxios(new CommonAPI(DataModelApis.DataOpenModelListGet))
    const openModels = (await request.quickSend()) as DataModelModel[]
    this.openModelOptions = openModels.map((model) => {
      return {
        label: `${model.modelKey} - ${model.name}`,
        value: model.modelKey,
      }
    })
  }
}

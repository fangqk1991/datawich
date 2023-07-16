import { Component } from 'vue-property-decorator'
import { TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { DataNormalForm } from './DataNormalForm'
import { DataDialogProtocol } from './DataDialogProtocol'

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
    'data-normal-form': DataNormalForm,
  },
  template: `
    <typical-dialog-view
      ref="my-dialog"
      :title="title"
      width="50%"
      :show-footer="true"
      :close-on-click-modal="false"
      :callback="callback"
    >
      <data-normal-form ref="my-form" :model-key="modelKey" :my-data="myData" :all-fields="allFields" />
    </typical-dialog-view>
  `,
})
export class GeneralDataDialog extends TypicalDialog implements DataDialogProtocol {
  allFields: ModelFieldModel[] = []
  modelKey: string = ''
  myData: any = {}

  constructor() {
    super()
  }

  public setFieldsAndData(modelKey: string, fields: ModelFieldModel[], data?: {}) {
    this.modelKey = modelKey
    this.allFields = fields
    if (!data) {
      data = {}
      for (const field of fields.filter((item) => item.useDefault)) {
        data[field.dataKey] = field.defaultValue
      }
    }
    this.myData = JSON.parse(JSON.stringify(data))
  }

  onHandleResult() {
    const myForm = this.$refs['my-form'] as DataNormalForm
    return myForm.exportResult()
  }
}

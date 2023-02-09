import { Component } from 'vue-property-decorator'
import { TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import { CustomConfigParams, TinyModelInfo } from '@fangcha/datawich-service'
import { ModelVersionForm } from './ModelVersionForm'

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
    'model-version-form': ModelVersionForm,
  },
  template: `
    <typical-dialog-view :title="title" width="60%" :callback="callback" :close-on-click-modal="false">
      <model-version-form v-model="configData" :available-models="availableModels" />
    </typical-dialog-view>
  `,
})
export class ModelVersionDialog extends TypicalDialog<CustomConfigParams> {
  availableModels: TinyModelInfo[] = []
  configData: CustomConfigParams = {
    modelKey: '',
    metadataVersion: '',
  }

  static dialog(availableModels: TinyModelInfo[]) {
    const dialog = new ModelVersionDialog()
    dialog.title = '选择模型配置'
    dialog.availableModels = availableModels
    return dialog
  }

  onHandleResult() {
    if (!this.configData) {
      this.$message.error('configData invalid')
      throw new Error('configData invalid')
    }
    if (!this.configData.modelKey) {
      this.$message.error('modelKey missing')
      throw new Error('modelKey missing')
    }
    if (!this.configData.metadataVersion) {
      this.$message.error('metadataVersion missing')
      throw new Error('metadataVersion missing')
    }
    return this.configData
  }
}

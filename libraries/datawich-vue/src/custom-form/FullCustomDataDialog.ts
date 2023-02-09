import { Component } from 'vue-property-decorator'
import { TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import {
  CustomConfigParams,
  FlexConfigParams,
  ModelFullMetadata,
  OperationLevel,
  TinyModelInfo,
} from '@fangcha/datawich-service'
import { CustomDataForm } from './CustomDataForm'
import { ModelVersionForm } from '../model'

interface FullParams {
  availableModels: TinyModelInfo[]
  operationLevel?: OperationLevel
  data?: FlexConfigParams
}

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
    'custom-data-form': CustomDataForm,
    'model-version-form': ModelVersionForm,
  },
  template: `
    <typical-dialog-view :title="title" width="60%" :callback="callback" :close-on-click-modal="false">
      <model-version-form
        v-show="isFullEditable"
        v-model="tagData"
        :available-models="availableModels"
        @change="onMetadataChange"
      />
      <div v-if="curModelVersionMetadata">
        <el-form v-show="isFullEditable" size="small" label-width="120px">
          <el-form-item label="表单名称" :required="true" class="my-form-item">
            <el-input v-model="data.name" type="text" style="width: 100%;" />
          </el-form-item>
        </el-form>
        <hr />
        <custom-data-form
          ref="my-form"
          :my-data="data.configData"
          :metadata="curModelVersionMetadata"
          :readonly="isReadonly"
        />
      </div>
    </typical-dialog-view>
  `,
})
export class FullCustomDataDialog extends TypicalDialog<FlexConfigParams> {
  availableModels: TinyModelInfo[] = []
  operationLevel: OperationLevel = OperationLevel.FullWritable
  curModelVersionMetadata: ModelFullMetadata | null = null

  onMetadataChange(_tagData: CustomConfigParams, metadata: ModelFullMetadata) {
    this.curModelVersionMetadata = metadata
  }

  get isFullEditable() {
    return this.operationLevel === OperationLevel.FullWritable
  }

  get isReadonly() {
    return this.operationLevel === OperationLevel.Readonly
  }

  tagData: CustomConfigParams = {
    modelKey: '',
    metadataVersion: '',
  }

  data: FlexConfigParams = {
    modelKey: '',
    metadataVersion: '',
    name: '',
    configData: {},
  }

  viewDidLoad() {
    if (this.data.modelKey) {
      this.tagData.modelKey = this.data.modelKey
    }
    if (this.data.metadataVersion) {
      this.tagData.metadataVersion = this.data.metadataVersion
    }
  }

  static dialogForCreate(fullParams: FullParams) {
    const dialog = new FullCustomDataDialog()
    dialog.availableModels = fullParams.availableModels
    if (fullParams.operationLevel) {
      dialog.operationLevel = fullParams.operationLevel
    }
    if (fullParams.data) {
      dialog.title = '复制配置'
      dialog.data = JSON.parse(JSON.stringify(fullParams.data))
    } else {
      dialog.title = '添加配置'
    }
    return dialog
  }

  static dialogForEdit(fullParams: FullParams) {
    const dialog = new FullCustomDataDialog()
    dialog.availableModels = fullParams.availableModels
    if (fullParams.operationLevel) {
      dialog.operationLevel = fullParams.operationLevel
    }
    dialog.title = '修改配置'
    if (fullParams.data) {
      dialog.data = JSON.parse(JSON.stringify(fullParams.data))
    }
    return dialog
  }

  onHandleResult() {
    if (!this.tagData.modelKey) {
      this.$message.error('tagData.modelKey missing')
      throw new Error('tagData.modelKey missing')
    }
    if (!this.tagData.metadataVersion) {
      this.$message.error('tagData.metadataVersion missing')
      throw new Error('tagData.metadataVersion missing')
    }
    if (!this.data.name) {
      this.$message.error('data.name missing')
      throw new Error('data.name missing')
    }
    this.data.modelKey = this.tagData.modelKey
    this.data.metadataVersion = this.tagData.metadataVersion
    const myForm = this.$refs['my-form'] as CustomDataForm
    this.data.configData = myForm.exportResult()
    return this.data
  }
}

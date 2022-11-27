import { Component } from 'vue-property-decorator'
import { TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import { ActionEvent, ActionEventDescriptor, FieldActionModel } from '@fangcha/datawich-service/lib/common/models'
import DerivativeActionExtension from './DerivativeActionExtension'

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
    'derivative-action-extension': DerivativeActionExtension,
  },
  template: `
    <typical-dialog-view :title="title" width="60%" :callback="callback">
      <el-form class="my-mini-form" label-width="120px" size="mini">
        <el-form-item label="动作类型" :required="true">
          <el-radio-group v-model="data.event" @change="onActionTypeChanged">
            <el-radio-button v-for="option in eventOptions" :key="option.value" :label="option.value">
              {{ LS(option.label) }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述文字" :required="true">
          <el-input v-model="data.title" type="text" style="width: 100%;" />
        </el-form-item>
        <el-form-item v-if="isLinkAction" :required="true">
          <span slot="label">
            <span>动作内容</span>
            <el-tooltip class="item" effect="dark" placement="top">
              <span class="el-icon-question" />
              <div slot="content">
                {{ wrapVar('xxx') }} 表示变量，请确保数据行存在此字段<br />
                例：https://abc.abc/company/{{ wrapVar('company_id') }}/
              </div>
            </el-tooltip>
          </span>
          <el-input v-model="data.content" type="text" style="width: 100%;" />
        </el-form-item>
        <derivative-action-extension v-if="isDerivativeAction" :derivative-info="derivativeInfo" />
      </el-form>
    </typical-dialog-view>
  `,
})
export default class FieldActionDialog extends TypicalDialog {
  eventOptions = ActionEventDescriptor.options()

  data: FieldActionModel | any = {
    event: ActionEvent.Link,
    title: '',
    content: '',
  }

  derivativeInfo = {
    toModelKey: '',
    toFieldKey: '',
  }

  wrapVar(variable: string) {
    return `{{.${variable}}}`
  }

  get isLinkAction() {
    return this.data.event === ActionEvent.Link
  }

  get isDerivativeAction() {
    return this.data.event === ActionEvent.DerivativeInfo
  }

  onActionTypeChanged() {
    if (this.isDerivativeAction) {
      if (!this.derivativeInfo.toModelKey && !this.derivativeInfo.toFieldKey) {
        this.derivativeInfo = {
          toModelKey: '',
          toFieldKey: '',
        }
      }
    }
  }

  constructor() {
    super()
  }

  viewDidLoad() {
    if (this.isDerivativeAction) {
      try {
        const derivativeInfo = JSON.parse(this.data.content) || {}
        this.derivativeInfo.toModelKey = derivativeInfo.toModelKey || ''
        this.derivativeInfo.toFieldKey = derivativeInfo.toFieldKey || ''
      } catch (e) {}
    }
  }

  static createActionDialog() {
    const dialog = new FieldActionDialog()
    dialog.title = '编辑动作'
    return dialog
  }

  static editActionDialog(data: FieldActionModel) {
    const dialog = new FieldActionDialog()
    dialog.title = '编辑动作'
    dialog.data = JSON.parse(JSON.stringify(data))
    return dialog
  }

  onHandleResult() {
    if (this.isDerivativeAction) {
      this.data.content = JSON.stringify(this.derivativeInfo)
    }
    return this.data
  }
}

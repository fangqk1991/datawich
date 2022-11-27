import { Component } from 'vue-property-decorator'
import { TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import { ModelClientModel } from '@fangcha/datawich-service/lib/common/models'

@Component({
  components: {
    'my-dialog': TypicalDialogView,
  },
  template: `
    <typical-dialog-view :title="title" width="60%" :callback="callback">
      <el-form label-width="120px">
        <el-form-item label="应用 ID" :required="true" class="my-form-item">
          <el-input v-model="data.appid" size="mini" type="text" style="width: 160px;" :disabled="forEditing" />
        </el-form-item>
        <el-form-item label="应用名称" :required="true" class="my-form-item">
          <el-input v-model="data.name" size="mini" type="text" style="width: 160px;" />
        </el-form-item>
      </el-form>
    </typical-dialog-view>
  `,
})
export class ModelClientDialog extends TypicalDialog {
  data: ModelClientModel | any = {
    appid: '',
    name: '',
  }
  forEditing = false

  constructor() {
    super()
  }

  static createAppDialog() {
    const dialog = new ModelClientDialog()
    dialog.title = '创建应用'
    return dialog
  }

  static editAppDialog(data: ModelClientModel) {
    const dialog = new ModelClientDialog()
    dialog.title = '编辑应用'
    dialog.forEditing = true
    dialog.data = Object.assign({}, data)
    return dialog
  }

  onHandleResult() {
    return this.data
  }
}

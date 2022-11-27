import { Component } from 'vue-property-decorator'
import { TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import { FieldGroupModel } from '@fangcha/datawich-service/lib/common/models'

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
  },
  template: `
    <typical-dialog-view :title="title" width="60%" :callback="callback">
      <el-form class="my-mini-form" label-width="120px" size="mini">
        <el-form-item label="组键值" :required="true">
          <el-input v-model="data.groupKey" type="text" style="width: 100%;" :disabled="forEditing" />
        </el-form-item>
        <el-form-item label="组名" :required="true">
          <el-input v-model="data.name" type="text" style="width: 100%;" />
        </el-form-item>
        <el-form-item :required="true">
          <span slot="label">
            <span>内容模板</span>
            <el-tooltip class="item" effect="dark" placement="top">
              <span class="el-icon-question" />
              <div slot="content">
                {{ wrapVar('xxx') }} 表示变量，请确保数据行存在此字段<br />
                例：vid: {{ wrapVar('vid') }}
              </div>
            </el-tooltip>
          </span>
          <el-input v-model="data.displayTmpl" type="text" style="width: 100%;" />
        </el-form-item>
      </el-form>
    </typical-dialog-view>
  `,
})
export default class FieldGroupDialog extends TypicalDialog {
  forEditing = false

  data: FieldGroupModel | any = {
    groupKey: '',
    name: '',
    displayTmpl: '',
  }

  wrapVar(variable: string) {
    return `{{.${variable}}}`
  }

  constructor() {
    super()
  }

  viewDidLoad() {}

  static createGroupDialog() {
    const dialog = new FieldGroupDialog()
    dialog.title = '创建组'
    return dialog
  }

  static editGroupDialog(data: FieldGroupModel) {
    const dialog = new FieldGroupDialog()
    dialog.title = '编辑组'
    dialog.data = JSON.parse(JSON.stringify(data))
    dialog.forEditing = true
    return dialog
  }

  onHandleResult() {
    return this.data
  }
}

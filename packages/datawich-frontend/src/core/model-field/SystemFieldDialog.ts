import { Component } from 'vue-property-decorator'
import { TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import { ModelFieldModel } from '@fangcha/datawich-service/lib/common/models'

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
  },
  template: `
    <typical-dialog-view :title="title" width="60%" :callback="callback">
      <el-form class="my-mini-form" label-width="120px" size="mini">
        <el-form-item label="字段 Key" :required="true">
          <el-input v-model="data.fieldKey" type="text" style="width: 200px;" :disabled="true"> </el-input>
        </el-form-item>
        <el-form-item label="字段名称" :required="true">
          <el-input v-model="data.name" type="text" style="width: 200px;"> </el-input>
        </el-form-item>
      </el-form>
    </typical-dialog-view>
  `,
})
export default class SystemFieldDialog extends TypicalDialog {
  data: ModelFieldModel | any = {
    fieldKey: '',
    name: '',
    star: 0,
  }

  constructor() {
    super()
  }

  viewDidLoad() {}

  static editFieldDialog(data: ModelFieldModel) {
    const dialog = new SystemFieldDialog()
    dialog.title = '编辑系统字段'
    dialog.data = JSON.parse(JSON.stringify(data))
    return dialog
  }

  onHandleResult() {
    return this.data
  }
}

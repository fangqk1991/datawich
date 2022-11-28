import { Component } from 'vue-property-decorator'
import { AlertTools, TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import { LogicExpression, LogicExpressionHelper } from '@fangcha/datawich-service/lib/common/models'

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
  },
  template: `
    <typical-dialog-view :title="title" width="70%" :callback="callback">
      <p>权限描述必须为标准的 JSON 格式，具体格式参考 LogicExpression</p>
      <div>
        <el-input v-model="expressionStr" :rows="10" type="textarea"></el-input>
      </div>
      <div class="mt-2">
        <el-button type="primary" size="mini" @click="formatExpressionMeta">格式化校验并刷新预览</el-button>
      </div>
    </typical-dialog-view>
  `,
})
export class LogicExpressionDialog extends TypicalDialog<LogicExpression> {
  expression: LogicExpression = LogicExpressionHelper.expressionExample()
  forEditing = false
  expressionStr = ''

  constructor() {
    super()
  }

  viewDidLoad() {
    this.expressionStr = JSON.stringify(this.expression, null, 2)
  }

  static dialogForEdit(data: LogicExpression) {
    const dialog = new LogicExpressionDialog()
    dialog.title = '编辑表达式'
    dialog.forEditing = true
    dialog.expression = JSON.parse(JSON.stringify(data))
    return dialog
  }

  async onHandleResult() {
    try {
      this.expression = JSON.parse(this.expressionStr)
    } catch (e) {
      this.$message.error(`JSON 格式有误`)
      throw e
    }
    return this.expression
  }

  formatExpressionMeta() {
    try {
      const expressionMeta = JSON.parse(this.expressionStr)
      LogicExpressionHelper.checkExpressionValid(expressionMeta)
      this.expression = expressionMeta
      this.expressionStr = JSON.stringify(expressionMeta, null, 2)
    } catch (e) {
      AlertTools.showAlert((e as any).message)
    }
  }
}

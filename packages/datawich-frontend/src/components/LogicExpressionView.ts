import { Component, JsonPre, ViewController } from '@fangcha/vue'
import { FilterSymbol, LogicExpression, LogicSymbol, } from '@web/datawich-common/models'
import { LogicExpressionDialog } from './LogicExpressionDialog'

@Component({
  components: {
    'json-pre': JsonPre,
  },
  template: `
    <div>
      <el-card>
        <h4>逻辑表达式</h4>
        <el-button @click="onClick_LogicExpressionDialog">编辑表达式</el-button>
        <json-pre class="mt-2" :value="expression" />
      </el-card>
    </div>
  `,
})
export class LogicExpressionView extends ViewController {
  expression: LogicExpression = {
    logic: LogicSymbol.OR,
    elements: [
      {
        condition: {
          leftKey: 'a',
          symbol: FilterSymbol.EQ,
          rightValue: 1,
        },
      },
      {
        logic: LogicSymbol.AND,
        elements: [
          {
            condition: {
              leftKey: 'b',
              symbol: FilterSymbol.GE,
              rightValue: 10,
            },
          },
          {
            condition: {
              leftKey: 'b',
              symbol: FilterSymbol.LE,
              rightValue: 20,
            },
          },
        ],
      },
    ],
  }

  onClick_LogicExpressionDialog() {
    const dialog = LogicExpressionDialog.dialogForEdit(this.expression)
    dialog.show((params) => {
      this.expression = params
    })
  }
}

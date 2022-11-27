import { Component } from 'vue-property-decorator'
import { TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import { SelectOption } from '@fangcha/tools'
import EnumFieldExtension from './EnumFieldExtension'
import { TransferSelectOption } from '@fangcha/datawich-service/lib/common/models'

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
    'enum-field-extension': EnumFieldExtension,
  },
  template: `
    <typical-dialog-view :title="title" width="60%" :callback="callback">
      <div class="mt-2">
        <ul>
          <li>用数字表示的「枚举」类型已经不被推荐，推荐使用表达范围更广、可读性更强的「文本枚举」</li>
          <li>若本字段被本模型其他枚举字段作为约束引用（多级级联枚举），请在修改后对相关字段进行调整</li>
          <li><b class="text-danger">本操作不可逆，请确认新旧枚举值的对应关系无误再行提交！</b></li>
        </ul>
        <el-table
          :data="options"
          size="mini"
          border
          :header-cell-style="{ 'background-color': '#fafafa' }"
        >
          <el-table-column label="原枚举值" prop="value" width="120px" />
          <el-table-column label="枚举名" min-width="150px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.label" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="新枚举值" min-width="150px">
            <template slot-scope="scope">
              <el-input v-model="scope.row.toValue" size="small" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </typical-dialog-view>
  `,
})
export default class EnumFieldTransferDialog extends TypicalDialog {
  options: TransferSelectOption[] = []

  constructor() {
    super()
  }

  viewDidLoad() {}

  static transferDialog(options: SelectOption[]) {
    const formatOptions = options.map((option) => {
      return {
        label: option.label,
        value: option.value,
        toValue: `${option.value}`,
      } as TransferSelectOption
    })
    const dialog = new EnumFieldTransferDialog()
    dialog.title = '转换为文本枚举'
    dialog.options = formatOptions
    return dialog
  }

  onHandleResult() {
    return this.options
  }
}

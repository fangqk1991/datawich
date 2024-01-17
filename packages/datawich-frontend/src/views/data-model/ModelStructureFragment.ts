import { Component } from '@fangcha/vue'
import { ModelFieldTable } from '../model-field/ModelFieldTable'
import { ModelFragmentBase } from './ModelFragmentBase'

@Component({
  components: {
    'model-field-table': ModelFieldTable,
  },
  template: `
    <div v-if="dataModel">
      <el-card shadow="never">
        <model-field-table @loadWidgetsInfo="onLoadWidgetsInfo" ref="fieldTableView" :model-key="modelKey" />
      </el-card>
    </div>
  `,
})
export class ModelStructureFragment extends ModelFragmentBase {
  async onLoadWidgetsInfo() {
    this.$nextTick(() => {
      {
        const tableView = this.$refs.fieldTableView as ModelFieldTable
        tableView.reloadData()
      }
    })
  }
}

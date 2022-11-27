import { Component } from '@fangcha/vue'
import { LinkedGroupTable } from '../widgets/LinkedGroupTable'
import { AuthClientTable } from '../widgets/AuthClientTable'
import { ModelFragmentBase } from './ModelFragmentBase'
import { CommonGroupTable } from '../common-group/CommonGroupTable'

@Component({
  components: {
    'common-group-table': CommonGroupTable,
    'linked-group-table': LinkedGroupTable,
    'auth-client-table': AuthClientTable,
  },
  template: `
    <div v-if="dataModel">
      <common-group-table
        namespace="group"
        :obj-key="modelKey"
        scope-text="模型范围"
        scope-hint="模型 key，如 work_log；* 表示所有模型"
        :reactive-query="false"
        @change="onGroupsChanged"
      >
        <h3 slot="header">成员组管理</h3>
      </common-group-table>
      <linked-group-table class="mt-4" ref="linkPanel" :model-key="modelKey" />
      <auth-client-table class="mt-4" :model-key="modelKey" />
    </div>
  `,
})
export class ModelAccessFragment extends ModelFragmentBase {
  onGroupsChanged() {
    const linkPanel = this.$refs['linkPanel'] as LinkedGroupTable
    linkPanel.reloadData()
  }
}

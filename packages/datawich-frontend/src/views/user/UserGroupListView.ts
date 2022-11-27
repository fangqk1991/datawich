import { Component, FragmentProtocol, ViewController } from '@fangcha/vue'
import { getModelSpaceOptions } from '@fangcha/general-group/lib/common/models'
import { CommonGroupTable } from '../common-group/CommonGroupTable'

@Component({
  components: {
    'common-group-table': CommonGroupTable,
  },
  template: `
    <div>
      <h2>用户组管理</h2>
      <common-group-table :space-options="modelSpaceOptions" />
    </div>
  `,
})
export class UserGroupListView extends ViewController implements FragmentProtocol {
  viewDidLoad() {}

  get modelSpaceOptions() {
    return getModelSpaceOptions()
  }

  resetFilter(_useQuery: boolean = false) {}
}

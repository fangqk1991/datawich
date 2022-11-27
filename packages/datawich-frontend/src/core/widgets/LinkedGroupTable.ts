import { Component, MyTableView, Prop, TableViewProtocol, ViewController } from '@fangcha/vue'
import { GeneralPermissionDescriptor } from '@fangcha/datawich-service/lib/common/models'
import { ModelGroupApis } from '@fangcha/datawich-service/lib/common/web-api'
import { CommonGroupModel, GroupSpace } from '@fangcha/general-group/lib/common/models'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { GroupPermissionDialog } from '../common-group/GroupPermissionDialog'
import { GroupMemberDialog } from '../common-group/GroupMemberDialog'

@Component({
  components: {
    'my-table-view': MyTableView,
  },
  template: `
    <my-table-view ref="tableView" :delegate="delegate">
      <h3 slot="header">外部引用组</h3>
      <el-table-column prop="groupId" label="组 ID" />
      <el-table-column prop="name" label="组名" />
      <el-table-column label="类型">
        <template slot-scope="scope">
          <el-tag v-if="checkGroupRetain(scope.row)" size="mini">保留组</el-tag>
          <el-tag v-else size="mini" type="danger">自定义组</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <a href="javascript:" @click="onManagePermissions(scope.row)">查看权限</a>
          |
          <a href="javascript:" @click="onManageMembers(scope.row)">查看成员</a>
        </template>
      </el-table-column>
    </my-table-view>
  `,
})
export class LinkedGroupTable extends ViewController {
  @Prop({ default: '', type: String }) readonly modelKey!: string

  get tableView() {
    return this.$refs.tableView as MyTableView
  }
  get delegate(): TableViewProtocol {
    return {
      loadData: async (_retainParams) => {
        const request = MyAxios(new CommonAPI(ModelGroupApis.ModelLinkedGroupListGet, this.modelKey))
        const items = (await request.quickSend()) as CommonGroupModel[]
        return {
          totalSize: items.length,
          elements: items,
        }
      },
      reactiveQueryParams: () => {
        return {}
      },
    }
  }

  viewDidLoad() {
    this.reloadData()
  }

  checkGroupRetain(feed: CommonGroupModel) {
    return feed.space === GroupSpace.ModelRetainGroup
  }

  async onManagePermissions(feed: CommonGroupModel) {
    const options = GeneralPermissionDescriptor.options()
    const dialog = GroupPermissionDialog.editDialog(feed, options, true)
    dialog.show(async () => {})
  }

  onManageMembers(feed: CommonGroupModel) {
    GroupMemberDialog.showMembers(feed, true)
  }

  reloadData() {
    this.tableView.reloadData()
  }
}

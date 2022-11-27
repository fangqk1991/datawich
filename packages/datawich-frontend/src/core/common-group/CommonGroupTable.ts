import {
  Component,
  ConfirmDialog,
  MySelect,
  MyTableView,
  Prop,
  SimpleInputDialog,
  TableViewProtocol,
  ViewController,
} from '@fangcha/vue'
import { GeneralPermissionDescriptor } from '@fangcha/datawich-service/lib/common/models'
import { CommonGroupApis, ModelUserApis } from '@fangcha/datawich-service/lib/common/web-api'
import { GroupMemberDialog } from './GroupMemberDialog'
import { GroupPermissionDialog } from './GroupPermissionDialog'
import { SelectOption } from '@fangcha/tools'
import { CommonGroupModel, GroupSpace, ScopeParams } from '@fangcha/general-group/lib/common/models'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'

@Component({
  components: {
    'my-select': MySelect,
    'my-table-view': MyTableView,
  },
  template: `
    <my-table-view ref="tableView" :delegate="delegate" :namespace="namespace" :reactive-query="reactiveQuery">
      <div class="mb-3" slot="header">
        <div>
          <slot name="header" />
          <el-button type="primary" size="mini" @click="onCreateItem">新建用户组</el-button>
        </div>
      </div>
      <el-table-column prop="groupId" label="组 ID" />
      <el-table-column prop="name" label="组名" />
      <el-table-column>
        <template v-slot:header>
          <my-select v-if="spaceOptions.length > 0" v-model="mySpace" @change="onFilterUpdate">
            <option value="">全部类型</option>
            <option v-for="option in spaceOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </my-select>
          <span v-else>类型</span>
        </template>
        <template slot-scope="scope">
          <el-tag v-if="checkGroupRetain(scope.row)" size="mini">保留组</el-tag>
          <el-tag v-else size="mini" type="danger">自定义组</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <a href="javascript:" @click="onManagePermissions(scope.row)">权限管理</a>
          |
          <a href="javascript:" @click="onManageMembers(scope.row)">成员管理</a>
          <template v-if="!checkGroupRetain(scope.row)">
            |
            <a href="javascript:" @click="onEditItem(scope.row)">编辑</a>
            |
            <a href="javascript:" @click="onDeleteItem(scope.row)">删除</a>
          </template>
        </template>
      </el-table-column>
    </my-table-view>
  `,
})
export class CommonGroupTable extends ViewController {
  @Prop({ default: '', type: String }) readonly namespace!: string
  @Prop({ default: '', type: String }) readonly space!: GroupSpace
  @Prop({ default: '', type: String }) readonly objKey!: string
  @Prop({ default: '范围', type: String }) readonly scopeText!: string
  @Prop({ default: '* 表示所有范围', type: String }) readonly scopeHint!: string
  @Prop({ default: () => [], type: Array }) readonly spaceOptions!: SelectOption[]
  @Prop({ default: true, type: Boolean }) readonly reactiveQuery!: boolean

  mySpace: string = ''

  get filterParams() {
    return {
      space: this.mySpace,
      objKey: this.objKey,
    }
  }

  get lockedGroupId() {
    return this.$route.query.lockedGroupId || ''
  }

  get tableView() {
    return this.$refs.tableView as MyTableView
  }
  get delegate(): TableViewProtocol {
    return {
      defaultSettings: {
        sortKey: 'createTime',
        pageSize: 20,
      },
      loadData: async (retainParams) => {
        const params = {
          ...retainParams,
          ...this.filterParams,
          groupId: this.lockedGroupId,
        }
        const request = MyAxios(ModelUserApis.ModelUserGroupListGet)
        request.setQueryParams(params)
        return request.quickSend()
      },
      reactiveQueryParams: (retainQueryParams) => {
        return Object.assign({}, retainQueryParams, this.filterParams)
      },
      onDataChanged: (feeds) => {
        this.$emit('change', feeds)
      },
    }
  }

  viewDidLoad() {
    this.mySpace = this.space
    this.tableView.reloadData()
  }

  onCreateItem() {
    const dialog = new SimpleInputDialog()
    dialog.placeholder = '用户组'
    dialog.show(async (name: string) => {
      const params = {
        name: name,
      }
      if (this.filterParams.objKey) {
        params['objKey'] = this.filterParams.objKey
      }
      const request = MyAxios(ModelUserApis.ModelUserGroupCreate)
      request.setBodyData(params)
      await request.execute()
      this.$message.success('创建成功')
      this.tableView.reloadData()
    })
  }

  onEditItem(feed: CommonGroupModel) {
    const dialog = new SimpleInputDialog()
    dialog.placeholder = '用户组'
    dialog.content = feed.name
    dialog.show(async (name: string) => {
      const request = MyAxios(new CommonAPI(CommonGroupApis.GroupInfoUpdate, feed.groupId))
      request.setBodyData({
        name: name,
      })
      await request.execute()
      this.$message.success('修改成功')
      this.tableView.reloadData()
    })
  }

  onDeleteItem(feed: CommonGroupModel) {
    const dialog = new ConfirmDialog()
    dialog.title = '删除用户组'
    dialog.content = `确定要删除 "${feed.name}" 吗？`
    dialog.show(async () => {
      await this.execHandler(async () => {
        const request = MyAxios(new CommonAPI(ModelUserApis.ModelUserGroupDelete, feed.groupId))
        await request.execute()
        this.$message.success('删除成功')
        this.tableView.reloadData()
      })
    })
  }

  onFilterUpdate() {
    this.tableView.onFilterUpdate()
  }

  checkGroupRetain(feed: CommonGroupModel) {
    return feed.space === GroupSpace.ModelRetainGroup
  }

  async onManagePermissions(feed: CommonGroupModel) {
    const readonly = this.checkGroupRetain(feed)
    const options = GeneralPermissionDescriptor.options()
    const dialog = GroupPermissionDialog.editDialog(feed, options, readonly)
    dialog.scopeText = this.scopeText
    dialog.scopeHint = this.scopeHint
    dialog.show(async (params: ScopeParams) => {
      const request = MyAxios(new CommonAPI(ModelUserApis.ModelUserGroupPermissionUpdate, feed.groupId))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('更新成功')
      this.tableView.reloadData()
      dialog.dismiss()
    })
  }

  onManageMembers(feed: CommonGroupModel) {
    GroupMemberDialog.showMembers(feed)
  }
}

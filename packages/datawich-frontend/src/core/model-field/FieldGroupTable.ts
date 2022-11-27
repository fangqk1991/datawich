import { Component, ConfirmDialog, MyTableView, Prop, TableViewProtocol, ViewController } from '@fangcha/vue'
import { FieldGroupModel, ModelFieldModel } from '@web/datawich-common/models'
import FieldGroupDialog from './FieldGroupDialog'
import { NotificationCenter } from 'notification-center-js'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { DataModelApis } from '@web/datawich-common/web-api'
import { DatawichEventKeys } from '../../services/DatawichEventKeys'

@Component({
  components: {
    'my-table-view': MyTableView,
  },
  template: `
    <my-table-view ref="tableView" :delegate="delegate" :single-page="true" :sort-in-local="true" :reactive-query="false">
      <div class="mb-3" slot="header">
        <h3>字段组管理</h3>
        <div>
          <el-button type="primary" size="mini" @click="onClickCreateItem">创建字段组</el-button>
        </div>
      </div>
      <el-table-column prop="groupKey" label="字段组 Key" />
      <el-table-column prop="name" label="字段组名称" />
      <el-table-column prop="displayTmpl" label="内容模板" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <a href="javascript:" @click="onEditItem(scope.row)">编辑</a>
          | <a href="javascript:" @click="onDeleteItem(scope.row)">删除</a>
        </template>
      </el-table-column>
    </my-table-view>
  `,
})
export class FieldGroupTable extends ViewController {
  @Prop({ default: '', type: String }) readonly modelKey!: string

  get tableView() {
    return this.$refs.tableView as MyTableView
  }
  get delegate(): TableViewProtocol {
    return {
      loadData: async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.ModelFieldGroupListGet, this.modelKey))
        const items = (await request.quickSend()) as FieldGroupModel[]
        return {
          totalSize: items.length,
          elements: items,
        }
      },
    }
  }

  viewDidLoad() {}

  reloadData() {
    this.tableView.reloadData()
  }

  onClickCreateItem() {
    const dialog = FieldGroupDialog.createGroupDialog()
    dialog.show(async (params: ModelFieldModel) => {
      const request = MyAxios(new CommonAPI(DataModelApis.ModelFieldGroupCreate, this.modelKey))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('创建成功')
      this.reloadData()
      NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
    })
  }

  onEditItem(feed: FieldGroupModel) {
    const dialog = FieldGroupDialog.editGroupDialog(feed)
    dialog.show(async (params: ModelFieldModel) => {
      const request = MyAxios(new CommonAPI(DataModelApis.ModelFieldGroupUpdate, this.modelKey, feed.groupKey))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('更新成功')
      this.reloadData()
      NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
    })
  }

  onDeleteItem(feed: FieldGroupModel) {
    const dialog = new ConfirmDialog()
    dialog.title = '删除关联'
    dialog.content = `确定要删除此字段组吗？`
    dialog.show(async () => {
      const request = MyAxios(new CommonAPI(DataModelApis.ModelFieldGroupDelete, feed.modelKey, feed.groupKey))
      await request.execute()
      this.$message.success('删除成功')
      this.reloadData()
      NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
    })
  }
}

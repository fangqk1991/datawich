import { Component, ConfirmDialog, MySwitch, MyTableView, Prop, TableViewProtocol, ViewController } from '@fangcha/vue'
import { DataModelApis } from '@fangcha/datawich-service/lib/common/web-api'
import FieldLinkDialog from './FieldLinkDialog'
import { FieldLinkModel, ModelFieldModel } from '@fangcha/datawich-service/lib/common/models'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { getRouterToModel } from '@fangcha/datawich-frontend'

@Component({
  components: {
    'my-switch': MySwitch,
    'my-table-view': MyTableView,
  },
  template: `
    <my-table-view ref="tableView" :delegate="delegate" :single-page="true" :sort-in-local="true" :reactive-query="false">
      <div class="mb-3" slot="header">
        <h3>关联管理</h3>
        <div>
          <el-button type="primary" size="mini" @click="onClickCreateLink">创建关联</el-button>
        </div>
      </div>
      <el-table-column prop="fieldKey" label="字段 Key" />
      <el-table-column label="关联键">
        <template slot-scope="scope">
          <router-link :to="routerToOuterModel(scope.row)" target="_blank" class="mr-2">
            {{ scope.row.refModel }}.{{ scope.row.refField }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="关注内容">
        <template slot-scope="scope">
          <template v-for="item in scope.row.referenceFields">
            <span>
              {{ item.fieldKey }} - {{ item.name }}<br />
            </span>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="内联展示" width="90px">
        <template slot-scope="scope">
          <my-switch v-model="scope.row.isInline" size="mini" @change="onIsInlineChanged(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="外键约束" width="90px">
        <template slot-scope="scope">
          <my-switch v-model="scope.row.isForeignKey" size="mini" @change="onIsForeignKeyChanged(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <a href="javascript:" @click="onEditItem(scope.row)">编辑</a>
          | <a href="javascript:" @click="onDeleteItem(scope.row)">删除</a>
        </template>
      </el-table-column>
    </my-table-view>
  `,
})
export class FieldLinkTable extends ViewController {
  @Prop({ default: '', type: String }) readonly modelKey!: string

  get tableView() {
    return this.$refs.tableView as MyTableView
  }
  get delegate(): TableViewProtocol {
    return {
      loadData: async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.ModelHoldingLinkListGet, this.modelKey))
        const items = (await request.quickSend()) as ModelFieldModel[]
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

  routerToOuterModel(link: FieldLinkModel) {
    return getRouterToModel(link.refModel)
  }

  onClickCreateLink() {
    const dialog = FieldLinkDialog.createLinkDialog()
    dialog.modelKey = this.modelKey
    dialog.show(async (params: any) => {
      const request = MyAxios(new CommonAPI(DataModelApis.ModelHoldingLinkCreate, this.modelKey))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('创建成功')
      this.reloadData()
    })
  }

  onEditItem(feed: FieldLinkModel) {
    const dialog = FieldLinkDialog.editLinkDialog(feed)
    dialog.modelKey = this.modelKey
    dialog.show(async (params: ModelFieldModel) => {
      const request = MyAxios(new CommonAPI(DataModelApis.ModelHoldingLinkUpdate, this.modelKey, feed.linkId))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('更新成功')
      this.reloadData()
    })
  }

  onDeleteItem(feed: FieldLinkModel) {
    const dialog = new ConfirmDialog()
    dialog.title = '删除关联'
    dialog.content = `确定要删除此关联吗？`
    dialog.show(async () => {
      const request = MyAxios(new CommonAPI(DataModelApis.ModelHoldingLinkDelete, feed.modelKey, feed.linkId))
      await request.execute()
      this.$message.success('删除成功')
      this.reloadData()
    })
  }

  async onIsInlineChanged(feed: FieldLinkModel) {
    const request = MyAxios(new CommonAPI(DataModelApis.ModelHoldingLinkUpdate, this.modelKey, feed.linkId))
    request.setBodyData({
      isInline: feed.isInline,
    })
    await request.execute()
    this.$message.success('更新成功')
    this.reloadData()
  }

  async onIsForeignKeyChanged(feed: FieldLinkModel) {
    const request = MyAxios(new CommonAPI(DataModelApis.ModelHoldingLinkUpdate, this.modelKey, feed.linkId))
    request.setBodyData({
      isForeignKey: feed.isForeignKey,
    })
    await request.execute()
    this.$message.success('更新成功')
    this.reloadData()
  }
}

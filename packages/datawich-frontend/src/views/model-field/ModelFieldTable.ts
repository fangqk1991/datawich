import {
  Component,
  ConfirmDialog,
  JsonImportDialog,
  MultiplePickerDialog,
  MySelect,
  MySwitch,
  MyTableView,
  Prop,
  SimpleInputDialog,
  SimplePickerDialog,
  TableViewProtocol,
  TextPreviewDialog,
  ViewController,
} from '@fangcha/vue'
import {
  checkIndexAbleField,
  FieldActionModel,
  FieldGroupModel,
  FieldIndexModel,
  FieldType,
  LogicExpressionHelper,
  ModelFieldModel,
} from '@web/datawich-common/models'
import { DataModelApis, ModelFieldApis, ModelIndexApis } from '@web/datawich-common/web-api'
import { CheckOption, SelectOption } from '@fangcha/tools'
import ModelFieldDialog from './ModelFieldDialog'
import SystemFieldDialog from './SystemFieldDialog'
import { NotificationCenter } from 'notification-center-js'
import FieldActionDialog from './FieldActionDialog'
import EnumFieldTransferDialog from './EnumFieldTransferDialog'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { DatawichEventKeys } from '../../services/DatawichEventKeys'
import { LogicExpressionDialog } from '../../components/LogicExpressionDialog'
import { getRouterToModel } from '../../services/ModelDataHelper'

@Component({
  components: {
    'my-switch': MySwitch,
    'my-table-view': MyTableView,
    'my-select': MySelect,
  },
  template: `
    <my-table-view ref="tableView" :delegate="delegate" :single-page="true" :sort-in-local="true" :reactive-query="false">
      <div class="mb-3" slot="header">
        <h3>字段管理</h3>
        <div v-if="!simpleMode">
          <el-button type="primary" size="mini" @click="onClickCreateField">创建常规字段</el-button>
          <el-button type="success" size="mini" @click="onManageSystemFields">管理系统字段</el-button>
          <el-button type="info" size="mini" @click="onEditBroadcastField">选择广播字段</el-button>
          <el-button type="success" size="mini" @click="onImportField">导入 JSON</el-button>
          <el-button v-if="$devEgg()" type="danger" size="mini" @click="onRebuildFields">重建字段</el-button>
        </div>
      </div>
      <el-table-column prop="fieldKey" label="字段 Key">
        <template slot-scope="scope">
          <span>{{ scope.row.fieldKey }}</span>
          <template v-if="scope.row.keyAlias">
            <br />
            <span>别名: {{ scope.row.keyAlias }}</span>
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="字段名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fieldType" label="字段类型" min-width="140px">
        <template slot-scope="scope">
          {{ scope.row.fieldType | describe_model_field_type }}
          <template v-if="scope.row.constraintKey"> [父级字段: {{ scope.row.constraintKey }}] </template>
          <template v-if="scope.row.fieldType === FieldType.Enum">
            [<a href="javascript:" @click="transferEnumToTextEnum(scope.row)">转换为文本枚举</a>]
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="required" label="是否隐藏" width="90px">
        <template slot-scope="scope">
          <my-switch v-model="scope.row.isHidden" :disabled="scope.row.required" @change="onIsHiddenChanged(scope.row)" size="mini" />
        </template>
      </el-table-column>
      <el-table-column prop="required" label="是否必填" width="90px">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isSystem" size="mini">自动填</el-tag>
          <my-switch v-else v-model="scope.row.required" @change="onIsRequiredChanged(scope.row)" size="mini" />
        </template>
      </el-table-column>
      <el-table-column prop="isUnique" label="是否唯一" width="90px">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.fieldKey === 'rid'" size="mini">唯一</el-tag>
          <el-tag v-else-if="scope.row.isSystem || !canHasIndex(scope.row)" size="mini" type="info">不可唯一</el-tag>
          <my-switch v-else v-model="uniqueBoolMap[scope.row.fieldKey]" size="mini" @change="onIsUniqueChanged(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="索引" width="90px">
        <template slot-scope="scope">
          <el-tag v-if="!canHasIndex(scope.row)" size="mini" type="info">不可索引</el-tag>
          <my-switch v-else v-model="indexBoolMap[scope.row.fieldKey]" size="mini" @change="onHasIndexChanged(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="特殊属性">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isSystem" size="mini">系统字段</el-tag>
          <el-tag v-if="scope.row.searchable" size="mini">可搜索</el-tag>
          <el-tag v-if="scope.row.useEnumSelector" size="mini">快速编辑</el-tag>
          <el-tag v-if="scope.row.extrasData.readonly" size="mini" type="warning">Readonly</el-tag>
          <el-tag v-if="scope.row.extrasData.matchRegex" size="mini" type="danger">{{ scope.row.extrasData.matchRegex }}</el-tag>
          <el-tag
            v-if="scope.row.extrasData.visibleLogic"
            size="mini"
            type="danger"
            class="cursor-pointer"
            @click="onShowVisibleLogic(scope.row)"
          >
            visibleLogic
          </el-tag>
          <el-button v-if="$devEgg()" size="mini" @click="onEditVisibleLogic(scope.row)">Edit visibleLogic</el-button>
          <el-tag
            v-if="scope.row.extrasData.requiredLogic"
            size="mini"
            type="danger"
            class="cursor-pointer"
            @click="onShowRequiredLogic(scope.row)"
          >
            requiredLogic
          </el-tag>
          <el-button v-if="$devEgg()" size="mini" @click="onEditRequiredLogic(scope.row)">Edit requiredLogic</el-button>
        </template>
      </el-table-column>
      <el-table-column label="所属组">
        <template slot-scope="scope">
          <my-select v-model="scope.row.groupKey" @change="onGroupChanged(scope.row)">
            <option value="">无</option>
            <option v-for="group in groupItems" :key="group.groupKey" :value="group.groupKey">
              {{ group.name }}
            </option>
          </my-select>
        </template>
      </el-table-column>
      <el-table-column prop="defaultValue" label="默认值" />
      <el-table-column label="动作">
        <template slot-scope="scope">
          <el-tag
            v-for="action in scope.row.actions"
            :key="action.actionId" size="mini" type="danger"
            closable
            @click="onUpdateAction(scope.row, action)"
            @close="onDeleteAction(scope.row, action)"
          >
            {{ action.event | describe_action_event }}: {{ action.title }}
          </el-tag>
          <a href="javascript:" @click="onAddAction(scope.row)">添加</a>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <a class="text-success" href="javascript:" @click="onTopItem(scope.row)">置顶</a> |
          <a href="javascript:" @click="onEditItem(scope.row)">编辑</a>
          <template v-if="!scope.row.isSystem">
            | <a href="javascript:" @click="onDeleteItem(scope.row)">删除</a>
          </template>
          <br />
          <template v-if="!scope.row.isSystem">
            <a class="text-danger" href="javascript:" @click="onCopyItem(scope.row)">复制</a> |
          </template>
          <a class="text-danger" href="javascript:" @click="onCloneFieldData(scope.row)">填充</a> |
          <a href="javascript:" @click="onShowItemRaw(scope.row)">Raw</a>
        </template>
      </el-table-column>
    </my-table-view>
  `,
})
export class ModelFieldTable extends ViewController {
  @Prop({ default: '', type: String }) readonly modelKey!: string
  @Prop({ default: false, type: Boolean }) readonly simpleMode!: boolean

  FieldType = FieldType

  fields: ModelFieldModel[] = []
  fieldMap: { [p: string]: ModelFieldModel } = {}
  indexMap: { [p: string]: FieldIndexModel } = {}
  uniqueBoolMap: { [p: string]: boolean } = {}
  indexBoolMap: { [p: string]: boolean } = {}
  groupItems: FieldGroupModel[] = []

  get tableView() {
    return this.$refs.tableView as MyTableView
  }
  get delegate(): TableViewProtocol {
    return {
      loadData: async () => {
        const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldListGet, this.modelKey))
        const items = (await request.quickSend()) as ModelFieldModel[]
        this.fields = items
        this.fieldMap = items.reduce((result, cur) => {
          result[cur.fieldKey] = cur
          return result
        }, {})
        this.rebuildIndexMaps()
        const visibleFields = items.filter((field) => !field.isSystem || !field.isHidden)
        return {
          totalSize: visibleFields.length,
          elements: visibleFields,
        }
      },
    }
  }

  rebuildIndexMaps() {
    for (const field of this.fields) {
      this.$set(this.indexBoolMap, field.fieldKey, this.fieldHasIndex(field))
      this.$set(this.uniqueBoolMap, field.fieldKey, this.fieldIsUnique(field))
    }
  }

  get systemFields() {
    return this.fields.filter((field) => !!field.isSystem)
  }

  viewDidLoad() {}

  fieldIsUnique(item: ModelFieldModel) {
    return !!(this.indexMap[item.fieldKey] && this.indexMap[item.fieldKey].isUnique)
  }

  fieldHasIndex(item: ModelFieldModel) {
    return item.fieldKey in this.indexMap
  }

  reloadData() {
    {
      const request = MyAxios(new CommonAPI(ModelIndexApis.DataModelColumnIndexListGet, this.modelKey))
      request.quickSend().then((items: FieldIndexModel[]) => {
        this.indexMap = items.reduce((result, cur) => {
          result[cur.fieldKey] = cur
          return result
        }, {})
        this.rebuildIndexMaps()
      })
    }
    this.reloadGroupItems()
    this.tableView.reloadData()
  }

  onManageSystemFields() {
    const options: CheckOption[] = this.systemFields.map((field) => {
      return {
        label: field.name,
        value: field.fieldKey,
        checked: !this.fieldMap[field.fieldKey].isHidden,
      }
    })
    const dialog = MultiplePickerDialog.dialogWithOptions(options)
    dialog.title = `展示系统字段`
    dialog.show(async (fieldKeys: string[]) => {
      const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelSystemFieldsShow, this.modelKey))
      request.setBodyData({
        fieldKeys: fieldKeys,
      })
      await request.execute()
      this.$message.success('调整成功')
      this.reloadData()
    })
  }

  onClickCreateField() {
    const dialog = ModelFieldDialog.createFieldDialog()
    dialog.modelKey = this.modelKey
    dialog.show(async (params: any) => {
      const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldCreate, this.modelKey))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('创建成功')
      this.reloadData()

      if (dialog.continueToCreate) {
        this.onClickCreateField()
      }
    })
  }

  onImportField() {
    const dialog = JsonImportDialog.dialog()
    dialog.title = '导入字段 JSON'
    dialog.show(async (params) => {
      const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldCreate, this.modelKey))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('创建成功')
      this.reloadData()
    })
  }

  onRebuildFields() {
    const dialog = SimpleInputDialog.textInputDialog()
    dialog.title = '根据原始数据表初始化字段'
    dialog.show(async (rawTableName) => {
      const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldsRebuild, this.modelKey))
      request.setBodyData({
        rawTableName: rawTableName,
      })
      await request.execute()
      this.$message.success('重建成功')
      this.reloadData()
    })
  }

  onCloneFieldData(toField: ModelFieldModel) {
    const options: SelectOption[] = this.fields
      .filter((field) => field.fieldKey !== toField.fieldKey)
      .map((field) => {
        return {
          label: field.name,
          value: field.fieldKey,
        }
      })
    const dialog = new SimplePickerDialog()
    dialog.options = options
    dialog.title = `将下方选中列的数据填充到当前列`
    dialog.show((fromFieldKey: string) => {
      const fromField = this.fieldMap[fromFieldKey]
      this.cloneFieldData(fromField, toField)
    })
  }

  onCopyItem(fromField: ModelFieldModel) {
    const dialog = ModelFieldDialog.createFieldDialog(fromField)
    dialog.modelKey = this.modelKey
    dialog.show(async (params: any) => {
      const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldCreate, this.modelKey))
      request.setBodyData(params)
      const field = (await request.quickSend()) as ModelFieldModel
      this.$message.success('创建成功')
      this.reloadData()
      this.cloneFieldData(fromField, field)
    })
  }

  onShowItemRaw(field: ModelFieldModel) {
    TextPreviewDialog.previewJSON(field)
  }

  cloneFieldData(fromField: ModelFieldModel, toField: ModelFieldModel) {
    const dialog = new ConfirmDialog()
    dialog.title = `请确认`
    dialog.content = `是否将 ${fromField.name} [${fromField.fieldKey}] 中的数据填充到 ${toField.name} [${toField.fieldKey}]？<br /><small style="color: red; font-weight: bold;">本操作为全量覆盖，且不可撤销，请务必谨慎</small>`
    dialog.show(async () => {
      const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldDataClone, this.modelKey, toField.fieldKey))
      request.setBodyData({
        copyFromFieldKey: fromField.fieldKey,
      })
      await request.execute()
      this.$message.success(
        `${fromField.name} [${fromField.fieldKey}] -> ${toField.name} [${toField.fieldKey}]  数据填充成功`
      )
    })
  }

  async onAddAction(feed: ModelFieldModel) {
    const dialog = FieldActionDialog.createActionDialog()
    dialog.show(async (params: FieldActionModel) => {
      const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldActionCreate, feed.modelKey, feed.fieldKey))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('添加成功')
      this.reloadData()
    })
  }

  async onUpdateAction(field: ModelFieldModel, action: FieldActionModel) {
    const dialog = FieldActionDialog.editActionDialog(action)
    dialog.show(async (params: FieldActionModel) => {
      const request = MyAxios(
        new CommonAPI(ModelFieldApis.DataModelFieldActionUpdate, field.modelKey, field.fieldKey, action.actionId)
      )
      request.setBodyData(params)
      await request.execute()
      this.$message.success('修改成功')
      this.reloadData()
    })
  }

  async onDeleteAction(field: ModelFieldModel, action: FieldActionModel) {
    const dialog = new ConfirmDialog()
    dialog.title = '移除动作'
    dialog.content = `确定要移除 "${action.title}" 吗？`
    dialog.show(async () => {
      const request = MyAxios(
        new CommonAPI(ModelFieldApis.DataModelFieldActionDelete, field.modelKey, field.fieldKey, action.actionId)
      )
      await request.execute()
      this.$message.success('移除成功')
      this.reloadData()
    })
  }

  async safeHandle(handler: Function, needConfirm: boolean) {
    if (needConfirm) {
      const dialog = new ConfirmDialog()
      dialog.content = `本字段被用于数据分析，可能会影响较多下游数据任务，请确认本操作已告知相关人员`
      dialog.show(async () => {
        await handler()
      })
    } else {
      await handler()
    }
  }

  onEditItem(feed: ModelFieldModel) {
    if (feed.isSystem) {
      const dialog = SystemFieldDialog.editFieldDialog(feed)
      dialog.show(async (params: ModelFieldModel) => {
        const request = MyAxios(new CommonAPI(ModelFieldApis.DataSystemModelFieldUpdate, feed.modelKey, feed.fieldKey))
        request.setBodyData(params)
        await request.execute()
        this.$message.success('修改成功')
        this.reloadData()
      })
    } else {
      const dialog = ModelFieldDialog.editFieldDialog(feed)
      dialog.modelKey = this.modelKey
      dialog.show(async (params: ModelFieldModel) => {
        const handler = async () => {
          const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldUpdate, feed.modelKey, feed.fieldKey))
          request.setBodyData(params)
          await request.execute()
          this.$message.success('修改成功')
          this.reloadData()
        }
        await this.safeHandle(handler, !!params.star)
      })
    }
  }

  onDeleteItem(feed: ModelFieldModel) {
    const dialog = ConfirmDialog.strongDialog()
    dialog.title = '删除字段'
    dialog.content = `确定要删除 "${feed.name}" 吗？`
    dialog.show(async () => {
      const handler = async () => {
        const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldDelete, feed.modelKey, feed.fieldKey))
        await request.execute()
        this.$message.success('删除成功')
        this.reloadData()
        NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnModelFieldsUpdated, this.modelKey)
      }
      await this.safeHandle(handler, !!feed.star)
    })
  }

  async onTopItem(feed: ModelFieldModel) {
    const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldTop, feed.modelKey, feed.fieldKey))
    await request.execute()
    this.$message.success('置顶成功')
    this.reloadData()
  }

  onShowVisibleLogic(feed: ModelFieldModel) {
    TextPreviewDialog.previewJSON(feed.extrasData.visibleLogic!)
  }

  onShowRequiredLogic(feed: ModelFieldModel) {
    TextPreviewDialog.previewJSON(feed.extrasData.requiredLogic!)
  }

  async onEditVisibleLogic(feed: ModelFieldModel) {
    const dialog = LogicExpressionDialog.dialogForEdit(
      feed.extrasData.visibleLogic || LogicExpressionHelper.expressionExample()
    )
    dialog.show(async (expression) => {
      const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldUpdate, feed.modelKey, feed.fieldKey))
      request.setBodyData({
        extrasData: {
          visibleLogic: expression,
        },
      })
      await request.execute()
      this.$message.success('修改成功')
      this.reloadData()
    })
  }

  async onEditRequiredLogic(feed: ModelFieldModel) {
    const dialog = LogicExpressionDialog.dialogForEdit(
      feed.extrasData.requiredLogic || {
        logicResult: false,
      }
    )
    dialog.show(async (expression) => {
      const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldUpdate, feed.modelKey, feed.fieldKey))
      request.setBodyData({
        extrasData: {
          requiredLogic: expression,
        },
      })
      await request.execute()
      this.$message.success('修改成功')
      this.reloadData()
    })
  }

  gotoModel(modelKey: string) {
    return getRouterToModel(modelKey)
  }

  onIsUniqueChanged(field: ModelFieldModel) {
    if (this.uniqueBoolMap[field.fieldKey]) {
      this.createIndex(field, this.uniqueBoolMap[field.fieldKey])
    } else if (this.indexBoolMap[field.fieldKey]) {
      this.createIndex(field, false)
    } else {
      this.dropIndex(field)
    }
  }

  onHasIndexChanged(field: ModelFieldModel) {
    if (this.indexBoolMap[field.fieldKey]) {
      this.createIndex(field, false)
    } else {
      this.dropIndex(field)
    }
  }

  createIndex(field: ModelFieldModel, isUnique: boolean) {
    const request = MyAxios(new CommonAPI(ModelIndexApis.DataModelColumnIndexCreate, field.modelKey, field.fieldKey))
    request.setBodyData({ isUnique: isUnique ? 1 : 0 })
    request
      .execute()
      .then(() => {
        this.$message.success('调整索引成功')
        this.reloadData()
      })
      .catch(() => {
        this.reloadData()
      })
  }

  dropIndex(field: ModelFieldModel) {
    const request = MyAxios(new CommonAPI(ModelIndexApis.DataModelColumnIndexDrop, field.modelKey, field.fieldKey))
    request
      .execute()
      .then(() => {
        this.$message.success('移除索引成功')
        this.reloadData()
      })
      .catch(() => {
        this.reloadData()
      })
  }

  onIsRequiredChanged(field: ModelFieldModel) {
    this.updateField(field, { required: field.required })
  }

  onIsHiddenChanged(field: ModelFieldModel) {
    this.updateField(field, { isHidden: field.isHidden })
  }

  async updateField(field: ModelFieldModel, params: Partial<ModelFieldModel>) {
    const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldUpdate, field.modelKey, field.fieldKey))
    request.setBodyData(params)
    request
      .execute()
      .then(() => {
        this.$message.success('修改成功')
        this.reloadData()
      })
      .catch(() => {
        this.reloadData()
      })
  }

  canHasIndex(field: ModelFieldModel) {
    return checkIndexAbleField(field.fieldType)
  }

  transferEnumToTextEnum(field: ModelFieldModel) {
    const dialog = EnumFieldTransferDialog.transferDialog(field.options)
    dialog.show(async (options: any) => {
      const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelEnumFieldTransfer, field.modelKey, field.fieldKey))
      request.setBodyData(options)
      await request.execute()
      this.$message.success('修改成功')
      this.reloadData()
    })
  }

  async reloadGroupItems() {
    const request = MyAxios(new CommonAPI(DataModelApis.ModelFieldGroupListGet, this.modelKey))
    this.groupItems = (await request.quickSend()) as FieldGroupModel[]
  }

  async onGroupChanged(field: ModelFieldModel) {
    this.updateField(field, { groupKey: field.groupKey })
  }

  onEditBroadcastField() {
    const options: CheckOption[] = this.fields.map((field) => {
      return {
        label: field.name,
        value: field.fieldKey,
        checked: !!this.fieldMap[field.fieldKey].forBroadcast,
      }
    })
    const dialog = MultiplePickerDialog.dialogWithOptions(options)
    dialog.title = `选择广播字段`
    dialog.show(async (fieldKeys: string[]) => {
      const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelBroadcastUpdate, this.modelKey))
      request.setBodyData({
        fieldKeys: fieldKeys,
      })
      await request.execute()
      this.$message.success('调整成功')
      this.tableView.reloadData()
      this.reloadData()
      this.$emit('loadWidgetsInfo')
    })
  }
}

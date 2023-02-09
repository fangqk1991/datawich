import {
  Component,
  ConfirmDialog,
  InformationDrawer,
  MultiplePickerDialog,
  MyTableView,
  Prop,
  TableViewProtocol,
  ViewController,
} from '@fangcha/vue'
import { CommonProfileApis, DataAppApis, DataModelApis, ModelFieldApis } from '@web/datawich-common/web-api'
import {
  DataModelModel,
  FieldType,
  ModelFieldModel,
} from '@fangcha/datawich-service'
import { CheckOption } from '@fangcha/tools'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { DownloadTaskHelper } from '@fangcha/vue/oss-service'
import { DataDialogProtocol, GeneralDataDialog } from '@fangcha/datawich-frontend'
import { NotificationCenter } from 'notification-center-js'
import { MyFavorSidebar } from './MyFavorSidebar'
import { DatawichEventKeys } from '../../services/DatawichEventKeys'
import { GeneralDataImportPanel } from './GeneralDataImportPanel'
import { MyDataColumn } from './MyDataColumn'
import { FieldDisplayMode, FieldHelper, GeneralPermission, ProfileEvent, } from '@web/datawich-common/models'
import { GeneralDataHelper } from '@fangcha/datawich-service'
import { FilterCondition, FilterSymbol } from '@fangcha/logic'

interface DataRecord {
  rid: number
  _data_id: string
}

const trimParams = (params: {}) => {
  params = params || {}
  const newParams = {}
  Object.keys(params)
    .filter((key) => {
      return params[key] !== ''
    })
    .forEach((key) => {
      newParams[key] = params[key]
    })
  return newParams
}

@Component({
  components: {
    'my-table-view': MyTableView,
    'my-data-column': MyDataColumn,
    'general-data-import-panel': GeneralDataImportPanel,
  },
  template: `
    <div>
      <div>
        <el-breadcrumb separator="/" class="mb-4 mt-2">
          <el-breadcrumb-item :to="{ name: 'DataAppListView' }">应用列表</el-breadcrumb-item>
          <el-breadcrumb-item v-if="dataModel">
            {{ dataModel.name }}
            <template v-if="!dataModel.isOnline">
              (未发布)
            </template>
            <template v-if="isManager">
              |
              <router-link :style="{ color: '#4b5cc4', cursor: 'pointer' }" :to="{ name: 'DataModelManageView', params: { modelKey: dataModel.modelKey } }">
                模型管理
              </router-link>
            </template>
            |
            <a :style="{ color: '#4b5cc4', cursor: 'pointer' }" href="javascript:" @click="toggleFavor">
              {{ favored ? '取消关注' : '关注' }}
            </a>
          </el-breadcrumb-item>
        </el-breadcrumb>
        <hr/>
        <el-card v-if="dataModel && dataModel.description" class="mb-4">
          <pre class="m-0">{{ dataModel.description }}</pre>
        </el-card>
        <el-card class="mt-3">
          <slot name="custom-filter-panel"/>
          <el-form class="mt-1" :inline="true" size="mini" label-position="top" @submit.native.prevent="onFilterUpdate">
            <el-form-item v-for="field in dateFields" :label="field.name" :key="field.filterKey">
              <el-date-picker
                v-model="customParams[field.filterKey]"
                type="daterange"
                range-separator="-"
                start-placeholder="From"
                end-placeholder="To"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width:210px"
                @change="onFilterUpdate"
              >
              </el-date-picker>
            </el-form-item>
          </el-form>
          <el-form class="mt-1" :inline="true" size="mini" label-position="top" @submit.native.prevent="onFilterUpdate">
            <el-form-item>
              <el-input
                v-model="customParams.keywords"
                clearable
                class="search-input"
                placeholder="关键字"
                style="width:300px"
                @keyup.enter.native="onFilterUpdate"
              >
                <template slot="append">
                  <el-button size="mini" @click="onFilterUpdate">搜索</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="resetFilter()">重置过滤器</el-button>
            </el-form-item>
            <el-form-item v-show="dataModel && dataModel.isDataExportable">
              <el-button v-loading="isLoading" @click="exportExcel"><i class="el-icon-download"/> 导出</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="success" @click="setDisplaySettings">管理展示字段</el-button>
            </el-form-item>
          </el-form>
          <h4>汇总信息</h4>
          <ul class="mt-1" style="font-size: 90%;">
            <li>{{ totalSize }} 条记录</li>
            <template v-if="summaryInfo">
              <li v-for="field in summaryNumberFields" :key="field.fieldKey">
                <template v-if="field.fieldType === FieldType.Integer">
                  {{ field.name }}: {{ summaryInfo[field.fieldKey] }}
                </template>
                <template v-if="field.fieldType === FieldType.Float">
                  {{ field.name }}: {{ summaryInfo[field.fieldKey] | digitFormat }}
                </template>
              </li>
            </template>
          </ul>
          <div>
            <template v-if="isBatchEditing">
              <el-button type="danger" size="mini" @click="onBatchDelete">删除选中行</el-button>
              <el-button size="mini" v-loading="isLoading" @click="onBatchRecordsExport"><i class="el-icon-download"/> 导出选中行</el-button>
              <el-button size="mini" @click="isBatchEditing = false">撤销</el-button>
            </template>
            <template v-else>
              <el-button v-if="!hideCreateButton" type="success" size="mini" @click="onClickCreate">添加数据</el-button>
              <el-button type="primary" size="mini" @click="isBatchEditing = true">批量拾取</el-button>
            </template>
          </div>
          <my-table-view 
            class="mt-2"
            ref="tableView" 
            :selectable="isBatchEditing"
            :delegate="tableDelegate" 
            :header-cell-style="headerCellStyle" 
            :row-click="rowClick" 
            :forbidden-query-words="['@']"
            page-layout="total, sizes, prev, pager, next"
            :page-sizes="[10, 50, 100]"
          >
            <slot name="custom-columns"/>
            <template v-for="field in displayFields">
              <template v-if="field.fieldType === FieldType.Group">
                <el-table-column v-if="field.fieldDisplayMode === FieldDisplayMode.Open" :label="field.name" align="center">
                  <template v-for="refField in field.groupFields">
                    <my-data-column
                      v-if="!hiddenFieldsMap[refField.filterKey]"
                      :field="refField"
                      :filter-options="customParams"
                      :tag-checked-map="tagsCheckedMap[refField.filterKey]"
                      @on-filter-change="onFilterUpdate"
                    />
                  </template>
                </el-table-column>
                <my-data-column v-else :field="field" @on-filter-change="onFilterUpdate" />
              </template>
              <template v-else>
                <my-data-column
                  v-if="!hiddenFieldsMap[field.filterKey]"
                  :field="field"
                  :filter-options="customParams"
                  :tag-checked-map="tagsCheckedMap[field.filterKey]"
                  @on-filter-change="onFilterUpdate"
                />
              </template>
              <template v-for="fieldLink in field.refFieldLinks">
                <template v-if="fieldLink.isInline && fieldLink.referenceFields.length > 0">
                  <el-table-column :label="field.name + ' 关联'" align="center">
                    <template v-for="refField in fieldLink.referenceFields">
                      <my-data-column
                        v-if="!hiddenFieldsMap[refField.filterKey]"
                        :super-field="field"
                        :field="refField"
                        :filter-options="customParams"
                        :tag-checked-map="tagsCheckedMap[refField.filterKey]"
                        @on-filter-change="onFilterUpdate"
                      />
                    </template>
                  </el-table-column>
                </template>
              </template>
            </template>
            <el-table-column label="操作" width="120px">
              <template slot-scope="scope">
                <a href="javascript:" @click="onClickView(scope.row)">查看 <span class="el-icon-view"/></a> |
                <a href="javascript:" @click="onClickCopy(scope.row)">复制 <span class="el-icon-document-copy"/></a>
                <br/>
                <a href="javascript:" @click="onClickEdit(scope.row)">编辑 <span class="el-icon-edit-outline"/></a> |
                <a href="javascript:" @click="onClickDelete(scope.row)">删除 <span class="el-icon-delete-solid"/></a>
              </template>
            </el-table-column>
          </my-table-view>
        </el-card>
        <el-card v-if="dataModel" class="mt-3" v-show="!hideCreateButton">
          <general-data-import-panel :data-model="dataModel" :fields="mainFields" @on-tasks-done="reloadData" />
        </el-card>
      </div>
    </div>
  `,
})
export class DataDisplayView extends ViewController {
  @Prop({ default: '', type: String }) readonly modelKey!: string
  @Prop({ default: GeneralDataDialog, type: Function }) readonly dialogClass!: {
    new (): DataDialogProtocol
  }

  get tableView() {
    return this.$refs.tableView as MyTableView
  }
  get tableDelegate(): TableViewProtocol {
    return {
      loadData: async (retainParams) => {
        const params = Object.assign({}, retainParams, this.customParams)
        this._latestParams = params

        const request = MyAxios(new CommonAPI(DataAppApis.DataAppRecordListGet, this.modelKey))
        request.setQueryParams(trimParams(params))
        const pageData = await request.quickSend()
        this.totalSize = pageData.totalSize
        this.summaryInfo = pageData.summaryInfo
        return pageData
      },
      reactiveQueryParams: (retainQueryParams) => {
        return Object.assign({}, retainQueryParams, this.customParams)
      },
    }
  }
  currentDrawerData: any = null
  FieldDisplayMode = FieldDisplayMode
  FieldType = FieldType
  dataModel: DataModelModel | any = null
  hiddenFieldsMap: { [p: string]: boolean } = {}
  customParams: any = this.initFilterParams(true)
  _latestParams: any = {}
  totalSize = 0
  isBatchEditing = false

  initFilterParams(useQuery = false) {
    const query = useQuery ? this.$route.query : {}
    return {
      author: query.author || '',
      keywords: query.keywords || '',
    }
  }

  summaryInfo: any = null
  tagsCheckedMap: any = {}
  mainFields: ModelFieldModel[] = []
  displayFields: ModelFieldModel[] = []
  allFields: ModelFieldModel[] = []
  customFields: ModelFieldModel[] = []
  detailDisplayFields: ModelFieldModel[] = []
  get hideCreateButton() {
    return !!this.dataModel?.extrasData?.hideCreateButton
  }

  async viewDidLoad() {
    await this.loadModelInfo()
    this.reloadDisplaySettings()
    this.loadFieldsData().then(() => {
      this.tableView.reloadData()
    })

    this.favored = MyFavorSidebar.checkAppFavor(this.modelKey)
    NotificationCenter.defaultCenter().addObserver(DatawichEventKeys.kOnFavorDataAppsChanged, () => {
      this.favored = MyFavorSidebar.checkAppFavor(this.modelKey)
    })

    if (this.$route.query._data_id) {
      this.onClickView({ _data_id: this.$route.query._data_id } as any)
      this.$saveQueryParams({ _data_id: '' })
    }
  }

  async reloadDisplaySettings() {
    const request = MyAxios(
      new CommonAPI(CommonProfileApis.ProfileInfoGet, ProfileEvent.UserModelAppDisplay, this.modelKey)
    )
    const displaySettings = await request.quickSend()
    this.hiddenFieldsMap = displaySettings.hiddenFieldsMap || {}
  }

  setDisplaySettings() {
    const options: CheckOption[] = this.allFields.map((field) => {
      return {
        label: field.name,
        value: field.filterKey,
        checked: !this.hiddenFieldsMap[field.filterKey],
      }
    })
    const dialog = MultiplePickerDialog.dialogWithOptions(options)
    dialog.title = `管理展示字段`
    dialog.show(async (_checkedFilterKeys: string[]) => {
      const checkedMap = dialog.checkedMap
      const request = MyAxios(
        new CommonAPI(CommonProfileApis.ProfileUserInfoUpdate, ProfileEvent.UserModelAppDisplay, this.modelKey)
      )
      const hiddenFieldsMap = { ...this.hiddenFieldsMap }
      for (const field of this.allFields) {
        const isHidden = !checkedMap[field.filterKey]
        if (isHidden) {
          hiddenFieldsMap[field.filterKey] = true
        } else {
          delete hiddenFieldsMap[field.filterKey]
        }
      }
      request.setBodyData({
        hiddenFieldsMap: hiddenFieldsMap,
      })
      await request.execute()
      this.$message.success('调整成功')
      this.reloadDisplaySettings()
    })
  }

  get isRetainModel() {
    return this.dataModel && !!this.dataModel.isRetained
  }

  get isLeader() {
    if (!this.dataModel) {
      return false
    }
    const powerData = this.dataModel.powerData
    return powerData[GeneralPermission.DoAnything] || powerData[GeneralPermission.AccessOthersData]
  }

  get isManager() {
    if (!this.dataModel) {
      return false
    }
    const powerData = this.dataModel.powerData
    return powerData[GeneralPermission.DoAnything] || powerData[GeneralPermission.ManageModel]
  }

  async loadModelInfo() {
    await this.execHandler(async () => {
      const request = MyAxios(new CommonAPI(DataModelApis.DataModelInfoGet, this.modelKey))
      this.dataModel = (await request.quickSend()) as DataModelModel
    })
    // 对自定义的视图进行强制跳转
    // if (this.dataModel.isCustom && this.$route.name === 'DataDisplayView' && !this.$route.query._redirect) {
    //   this.$router.replace({
    //     name: 'DataCustomAppView',
    //     params: {
    //       modelKey: this.dataModel.modelKey,
    //     },
    //     query: {
    //       _redirect: '1',
    //     },
    //   })
    // }
  }

  get dateFields() {
    return this.allFields.filter((field) => [FieldType.Date, FieldType.Datetime].includes(field.fieldType as FieldType))
  }

  get summaryNumberFields() {
    return this.mainFields.filter(
      (field) => FieldHelper.checkCalculableField(field.fieldType as FieldType) && field.fieldKey !== 'rid'
    )
  }

  get writeableFields() {
    return this.mainFields.filter((field) => !field.isSystem)
  }

  get hasAuthorField() {
    return !!this.mainFields.find((field) => field.fieldKey === 'author')
  }

  async loadFieldsData() {
    const allFields: ModelFieldModel[] = []
    const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelVisibleFieldListGet, this.modelKey))
    this.mainFields = (await request.quickSend()) as ModelFieldModel[]
    for (const field of this.mainFields) {
      allFields.push(field)
      field.refFieldLinks.forEach((link) => {
        if (link.isInline) {
          allFields.push(...link.referenceFields)
        }
      })
    }
    this.allFields = allFields
    this.displayFields = FieldHelper.makeDisplayFields(this.mainFields)
    const query = this.$route.query
    allFields.forEach((field) => {
      const filterKey = field.filterKey
      if (field.fieldType === FieldType.Tags) {
        const value = Number(query[filterKey] || 0)
        const checkedMap = GeneralDataHelper.extractCheckedMapForValue(value, field)
        this.$set(this.customParams, filterKey, value)
        this.$set(this.tagsCheckedMap, filterKey, checkedMap)
      } else if (field.fieldType === FieldType.MultiEnum) {
        const value = String(query[filterKey] || '')
        const checkedMap = GeneralDataHelper.extractMultiEnumCheckedMapForValue(value, field.options)
        this.$set(this.customParams, filterKey, value)
        this.$set(this.tagsCheckedMap, filterKey, checkedMap)
      } else if (field.fieldType === FieldType.Date) {
        if (Array.isArray(query[filterKey]) && query[filterKey].length === 2) {
          this.$set(this.customParams, filterKey, query[filterKey])
        } else {
          this.$set(this.customParams, filterKey, null)
        }
      } else {
        this.$set(this.customParams, filterKey, query[filterKey] || '')
      }
    })
  }

  onClickCreate() {
    const dialog = new this.dialogClass()
    dialog.title = '新建数据记录'
    dialog.setFieldsAndData(this.modelKey, this.writeableFields)
    dialog.show(async (params: any) => {
      const request = MyAxios(new CommonAPI(DataAppApis.DataAppRecordCreate, this.modelKey))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('创建成功')
      this.reloadData()
    })
  }

  async onClickView(data: any) {
    const request = MyAxios(new CommonAPI(DataAppApis.DataAppRecordInfosGet, this.modelKey, data._data_id))
    const infos = await request.quickSend()
    InformationDrawer.show('数据详情', infos)
  }

  rowClick(row: any) {
    this.currentDrawerData = row
  }

  onClickCopy(data: DataRecord) {
    const inputData = FieldHelper.cleanDataByModelFields(data, this.mainFields)
    const dialog = new this.dialogClass()
    dialog.title = '复制数据记录'
    dialog.setFieldsAndData(this.modelKey, this.writeableFields, inputData)
    dialog.show(async (params: any) => {
      const request = MyAxios(new CommonAPI(DataAppApis.DataAppRecordCreate, this.modelKey))
      request.setQueryParams({ copy: 1 })
      request.setBodyData(params)
      await request.execute()
      this.$message.success('创建成功')
      this.reloadData()
    })
  }

  onClickEdit(data: DataRecord) {
    const inputData = FieldHelper.cleanDataByModelFields(data, this.mainFields)
    const dialog = new this.dialogClass()
    dialog.title = '修改数据记录'
    dialog.setFieldsAndData(this.modelKey, this.writeableFields, inputData)
    dialog.show(async (params: any) => {
      const request = MyAxios(new CommonAPI(DataAppApis.DataAppRecordUpdate, this.modelKey, data._data_id))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('修改成功')
      this.reloadData()
    })
  }

  onClickDelete(data: DataRecord) {
    const dialog = new ConfirmDialog()
    dialog.title = `请确认`
    dialog.content = `是否删除本记录？`
    dialog.show(async () => {
      const request = MyAxios(new CommonAPI(DataAppApis.DataAppRecordDelete, this.modelKey, data._data_id))
      await request.execute()
      this.$message.success('删除成功')
      this.reloadData()
    })
  }

  resetFilter(useQuery = false) {
    const params = this.initFilterParams(useQuery)

    this.allFields.forEach((field) => {
      const filterKey = field.filterKey
      if (field.fieldType === FieldType.Tags) {
        params[filterKey] = 0
        this.tagsCheckedMap[field.filterKey] = GeneralDataHelper.extractCheckedMapForValue(0, field)
      } else if (field.fieldType === FieldType.Date) {
        params[filterKey] = null
      } else {
        params[field.filterKey] = ''
      }
    })

    this.customParams = params
    this.tableView.resetFilter(useQuery)
  }

  async exportExcel() {
    await this.execHandler(async () => {
      const request = MyAxios(new CommonAPI(DataAppApis.DataAppExcelExport, this.modelKey))
      request.setBodyData(trimParams(this._latestParams))
      const response = await request.quickSend()
      DownloadTaskHelper.handleDownloadResponse(response)
    })
  }

  async onBatchRecordsExport() {
    const dataItems = this.getSelectedDataItems()
    const condition: FilterCondition = {
      leftKey: `${this.modelKey}.rid`,
      symbol: FilterSymbol.IN,
      rightValue: dataItems.map((item) => item.rid),
    }
    await this.execHandler(async () => {
      const request = MyAxios(new CommonAPI(DataAppApis.DataAppExcelExport, this.modelKey))
      request.setBodyData({
        ...trimParams(this._latestParams),
        conditions: [condition],
      })
      const response = await request.quickSend()
      DownloadTaskHelper.handleDownloadResponse(response)
    })
  }

  headerCellStyle({ column }: any) {
    const fieldKey = column.property
    if (this.customParams[fieldKey]) {
      return {
        background: '#FFFBE7',
      }
    }
  }

  reloadData() {
    this.tableView.reloadData()
  }

  onFilterUpdate() {
    this.tableView.onFilterUpdate()
  }

  getSelectedDataItems(): DataRecord[] {
    return this.tableView.getSelectedDataItems()
  }

  onBatchDelete() {
    const dataItems = this.getSelectedDataItems()
    if (dataItems.length === 0) {
      return
    }
    const indexesDesc = dataItems.map((item) => `${item.rid}`).join(', ')
    const dialog = new ConfirmDialog()
    dialog.content = `确定要删除所选 ${dataItems.length} 条数据吗？序号分别为 ${indexesDesc}`
    dialog.show(async () => {
      for (const item of dataItems) {
        const request = MyAxios(new CommonAPI(DataAppApis.DataAppRecordDelete, this.modelKey, item._data_id))
        await request.execute()
        this.$message.success(`[rid = ${item.rid}] 删除成功`)
      }
      this.reloadData()
    })
  }

  favored = false
  async toggleFavor() {
    this.favored = !this.favored
    await MyFavorSidebar.toggleAppFavor(this.modelKey)
  }
}

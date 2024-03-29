import {
  Component,
  FragmentProtocol,
  GridView,
  JsonImportDialog,
  TableViewProtocol,
  ViewController,
} from '@fangcha/vue'
import { DataModelModel, ModelFullMetadata } from '@fangcha/datawich-service'
import { DataAppApis, DataModelApis } from '@web/datawich-common/admin-apis'
import { SelectOption } from '@fangcha/tools'
import { AppTask, AppTaskQueue } from 'fc-queue'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { DataModelDialog } from '../widgets/DataModelDialog'
import { DataModelCard } from './DataModelCard'
import { getRouterToDataApp } from '../../services/ModelDataHelper'

@Component({
  components: {
    'grid-view': GridView,
    'data-model-card': DataModelCard,
  },
  template: `
    <div>
      <h2>{{ LS('[i18n] Model List') }}</h2>
      <el-form class="mb-2" :inline="true" size="mini" label-position="top" @submit.native.prevent>
        <el-form-item :label="LS('[i18n] Quick Search')">
          <common-picker
            v-model="filterParams.modelKey"
            filterable
            :options="this.modelOptions"
            style="width: 320px;"
            @change="onFilterUpdate"
          />
        </el-form-item>
        <el-form-item :label="$whitespace">
          <el-button type="primary" size="mini" @click="onClickCreate">{{ LS('Create') }}</el-button>
        </el-form-item>
        <el-form-item :label="$whitespace">
          <el-button type="success" size="mini" @click="onImportModel">{{ LS('[i18n] Import') }}</el-button>
        </el-form-item>
      </el-form>
      <grid-view ref="tableView" :delegate="delegate">
        <data-model-card slot-scope="scope" :data="scope.data" :count="countData[scope.data.modelKey]" class="mr-2" />
      </grid-view>
    </div>
  `,
})
export class DataModelListView extends ViewController implements FragmentProtocol {
  countData: { [modelKey: string]: number } = {}
  currentItems: DataModelModel[] = []

  initFilterParams(useQuery = false) {
    const query = useQuery ? this.$route.query : {}
    return {
      modelKey: query.modelKey || '',
      isRetained: query.isRetained || '',
      modelType: query.modelType || '',
    }
  }
  filterParams = this.initFilterParams(true)

  tableView() {
    return this.$refs.tableView as GridView
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
        }
        const request = MyAxios(DataModelApis.DataModelListGet)
        request.setQueryParams(params)
        const items = (await request.quickSend()) as any
        this.currentItems = items
        this.reloadModelRecordCounts()
        return {
          elements: items,
          totalSize: items.length,
        }
      },
    }
  }

  getTotalCount() {
    if (this.tableView()) {
      return this.tableView().pageInfo.total
    }
    return 0
  }

  viewDidLoad() {
    this.reloadData()
  }

  onFilterUpdate() {
    this.tableView().reloadData()
  }

  reloadData() {
    this.tableView().reloadData()
    this.loadAllModels()
  }

  modelOptions: SelectOption[] = []
  async loadAllModels() {
    const request = MyAxios(DataAppApis.DataAppListGet)
    const modelList = (await request.quickSend()) as DataModelModel[]
    this.modelOptions = modelList.map((item) => {
      return {
        label: `${item.name}(${item.modelKey})`,
        value: item.modelKey,
      }
    })
  }

  routeToDataApp(dataModel: DataModelModel) {
    return getRouterToDataApp(dataModel)
  }

  onClickCreate() {
    const dialog = DataModelDialog.createModelDialog()
    dialog.show(async (params: DataModelModel) => {
      const request = MyAxios(DataModelApis.DataModelCreate)
      request.setBodyData(params)
      await request.quickSend()
      this.$message.success('创建成功')
      this.reloadData()
    })
  }

  onImportModel() {
    const dialog = JsonImportDialog.dialog()
    dialog.show(async (metadata: ModelFullMetadata) => {
      const request = MyAxios(DataModelApis.DataModelImport)
      request.setBodyData(metadata)
      await request.quickSend()
      this.$message.success('导入成功')
      this.reloadData()
    })
  }

  resetFilter(useQuery: boolean = false) {
    this.tableView().resetFilter(useQuery)
  }

  async reloadModelRecordCounts() {
    const todoModels = this.currentItems.filter((item) => !(item.modelKey in this.countData))
    const taskQueue = new AppTaskQueue()
    taskQueue.setMaxConcurrent(10)
    taskQueue.setPendingLimit(-1)

    for (const dataModel of todoModels) {
      taskQueue.addTask(
        new AppTask(async () => {
          this.$set(this.countData, dataModel.modelKey, null)
          const request = MyAxios(new CommonAPI(DataModelApis.DataModelSummaryInfoGet, dataModel.modelKey))
          request.setMute(true)
          await request.quickSend().then(({ count }) => {
            this.$set(this.countData, dataModel.modelKey, count)
          })
        })
      )
    }

    taskQueue.resume()
  }
}

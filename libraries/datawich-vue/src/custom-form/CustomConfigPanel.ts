import { Component } from 'vue-property-decorator'
import { Prop, ViewController } from '@fangcha/vue'
import {
  FlexConfigModel,
  FlexConfigParams,
  ModelFullMetadata,
  OperationLevel,
} from '@fangcha/datawich-service'
import { AppTask, AppTaskQueue } from 'fc-queue'
import { CommonAPI } from '@fangcha/app-request'
import { CustomConfigCard } from './CustomConfigCard'
import { DatawichFrontendService } from '../DatawichFrontendService'
import { ModelVersionSpan } from '../model'
import { ModelMetadataCenter } from '../utils'

@Component({
  components: {
    'custom-config-card': CustomConfigCard,
    'model-version-span': ModelVersionSpan,
  },
  template: `
    <div v-loading="isLoading">
      <h4>
        {{ title }}
        <small style="font-size: 70%;">{{ summary }}</small>
      </h4>
      <div v-if="editable && operationLevel === OperationLevel.FullWritable" class="mb-2">
        <el-button type="primary" size="mini" @click="onCreateItem()">添加</el-button>
      </div>
      <el-table :data="configList" border stripe size="small">
        <el-table-column label="ID">
          <template slot-scope="scope">
            {{ scope.row.configId }}
          </template>
        </el-table-column>
        <el-table-column label="名称">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="结构信息">
          <template slot-scope="scope">
            <model-version-span :tag-data="scope.row" />
          </template>
        </el-table-column>
        <el-table-column label="配置内容">
          <template slot-scope="scope">
            <template v-if="metadataData[scope.row.configId] === null">
              加载中……
            </template>
            <template v-else-if="metadataData[scope.row.configId]">
              <custom-config-card :metadata="metadataData[scope.row.configId]" :config-data="scope.row.configData" />
            </template>
          </template>
        </el-table-column>
        <el-table-column v-if="editable && operationLevel !== OperationLevel.Readonly" label="操作">
          <template slot-scope="scope">
            <a href="javascript:" @click="onEditItem(scope.row)">修改</a>
            <template v-if="operationLevel === OperationLevel.FullWritable">
              | <a class="text-success" href="javascript:" @click="onCreateItem(scope.row)">复制</a>
              | <a class="text-danger" href="javascript:" @click="onDeleteItem(scope.row)">删除</a>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
  `,
})
export class CustomConfigPanel extends ViewController {
  @Prop({ default: false, type: Boolean }) readonly editable!: boolean

  get title() {
    return ''
  }

  get summary() {
    return ''
  }

  get configList(): FlexConfigModel[] {
    return []
  }

  buildGeneralDataModelPage(modelKey: string) {
    return CommonAPI.buildUrl(DatawichFrontendService.systemInfo.modelStructureBaseURL, modelKey)
  }

  viewDidLoad() {
    this.reloadConfigMetadata()
  }

  OperationLevel = OperationLevel

  get operationLevel() {
    return OperationLevel.Readonly
  }

  constructor() {
    super()
  }

  onCreateItem(_data?: FlexConfigParams) {
    throw new Error(`未实现的创建方法`)
  }

  onEditItem(_data: FlexConfigModel) {
    throw new Error(`未实现的编辑方法`)
  }

  onDeleteItem(_data: FlexConfigModel) {
    throw new Error(`未实现的删除方法`)
  }

  metadataData: { [configId: string]: ModelFullMetadata } = {}
  async reloadConfigMetadata() {
    const todoConfigList = this.configList.filter((item) => !this.metadataData[item.configId])
    const taskQueue = new AppTaskQueue()
    taskQueue.setMaxConcurrent(10)
    taskQueue.setPendingLimit(-1)

    for (const config of todoConfigList) {
      taskQueue.addTask(
        new AppTask(async () => {
          this.$set(this.metadataData, config.configId, null)
          const metadata = await ModelMetadataCenter.prepareVersionMetadata(config.modelKey, config.metadataVersion)
          this.$set(this.metadataData, config.configId, metadata)
        })
      )
    }
    taskQueue.resume()
  }

  onCoreDataNeedReload() {
    this.$emit('change', this)
  }
}

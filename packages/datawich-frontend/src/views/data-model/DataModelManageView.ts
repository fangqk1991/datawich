import { DataModelModel } from '@fangcha/datawich-service/lib/common/models'
import { Component, ViewController } from '@fangcha/vue'
import { DataModelApis } from '@web/datawich-common/web-api'
import { NotificationCenter } from 'notification-center-js'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { ModelInfoFragment } from './ModelInfoFragment'
import { ModelStructureFragment } from './ModelStructureFragment'
import { ModelAccessFragment } from './ModelAccessFragment'
import { ModelFeatureFragment } from './ModelFeatureFragment'
import { DatawichEventKeys } from '../../services/DatawichEventKeys'

@Component({
  components: {
    'model-info-fragment': ModelInfoFragment,
    'model-structure-fragment': ModelStructureFragment,
    'model-access-fragment': ModelAccessFragment,
    'model-feature-fragment': ModelFeatureFragment,
  },
  template: `
    <div>
      <el-breadcrumb separator="/" class="mb-4 mt-2">
        <el-breadcrumb-item :to="{ name: 'DataModelListView' }">模型列表</el-breadcrumb-item>
        <el-breadcrumb-item v-if="dataModel">{{ dataModel.name }}</el-breadcrumb-item>
      </el-breadcrumb>
      <hr />
      <el-tabs v-model="curTab" type="border-card" @tab-click="onTabClick">
        <el-tab-pane name="fragment-model-info" label="基本信息">
          <model-info-fragment :data-model="dataModel" />
        </el-tab-pane>
        <el-tab-pane name="fragment-model-structure" label="结构管理">
          <model-structure-fragment :data-model="dataModel" />
        </el-tab-pane>
        <el-tab-pane name="fragment-access-management" label="访问管理">
          <model-access-fragment :data-model="dataModel" />
        </el-tab-pane>
        <el-tab-pane v-if="false" name="fragment-model-feature" label="功能管理">
          <model-feature-fragment :data-model="dataModel" />
        </el-tab-pane>
      </el-tabs>
    </div>
  `,
})
export class DataModelManageView extends ViewController {
  curTab = 'fragment-model-info'
  dataModel: DataModelModel | any = null

  get modelKey() {
    return this.$route.params.modelKey
  }

  onTabClick() {
    this.$saveQueryParams({ curTab: this.curTab })
  }

  viewDidLoad() {
    const query = this.$route.query as any
    this.curTab = query.curTab || 'fragment-model-info'

    NotificationCenter.defaultCenter().addObserver(DatawichEventKeys.kOnDataModelNeedReload, (modelKey: string) => {
      if (modelKey === this.modelKey) {
        this.reloadModelInfo()
      }
    })

    this.execHandler(async () => {
      await MyAxios(new CommonAPI(DataModelApis.DataModelAccessibleCheck, this.modelKey)).quickSend()
      this.reloadModelInfo()
    })
  }

  async reloadModelInfo() {
    await this.execHandler(async () => {
      this.dataModel = await MyAxios(new CommonAPI(DataModelApis.DataModelInfoGet, this.modelKey)).quickSend()
    })
  }
}

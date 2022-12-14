import { Component, JsonImportDialog, MultipleLinesInputDialog } from '@fangcha/vue'
import { ModelMilestoneModel } from '@fangcha/datawich-service/lib/common/models'
import { ModelMilestoneApis } from '@web/datawich-common/web-api'
import { MilestoneInfoDialog } from '../widgets/MilestoneInfoDialog'
import * as moment from 'moment'
import { NotificationCenter } from 'notification-center-js'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { ModelFragmentBase } from './ModelFragmentBase'
import { DatawichEventKeys } from '../../services/DatawichEventKeys'

@Component({
  template: `
    <div>
      <h3>{{ LS('[i18n] Model Versions') }}</h3>
      <div>
        <el-button size="mini" type="primary" @click="onCreateMilestone">{{ LS('Create') }}</el-button>
        <el-button size="mini" type="success" @click="onImportMilestone">{{ LS('[i18n] Import') }}</el-button>
      </div>
      <hr />
      <div class="mt-2" style="line-height: 2;">
        <el-tag class="cursor-pointer" type="danger" size="small" @click="showMilestoneInfo(masterMilestone)">
          master
        </el-tag>
        <el-tag
          v-for="item in milestoneList"
          :key="item.uid"
          class="cursor-pointer"
          size="small"
          @click="showMilestoneInfo(item)"
        >
          {{ item.tagName }}
        </el-tag>
      </div>
    </div>
  `,
})
export class ModelMilestonePanel extends ModelFragmentBase {
  milestoneList: ModelMilestoneModel[] = []

  viewDidLoad() {
    NotificationCenter.defaultCenter().addObserver(DatawichEventKeys.kOnDataModelMilestonesNeedReload, () => {
      this.reloadMilestoneList()
    })
    this.reloadMilestoneList()
  }

  async reloadMilestoneList() {
    const request = MyAxios(new CommonAPI(ModelMilestoneApis.ModelMilestoneListGet, this.modelKey))
    this.milestoneList = (await request.quickSend()) as ModelMilestoneModel[]
  }

  get masterMilestone() {
    return {
      uid: 'master',
      modelKey: this.modelKey,
      tagName: 'master',
      description: '????????????',
      metadataStr: '',
      createTime: moment().format(),
    } as ModelMilestoneModel
  }

  showMilestoneInfo(feed: ModelMilestoneModel) {
    const dialog = MilestoneInfoDialog.dialog(feed)
    dialog.show()
  }

  async onCreateMilestone() {
    const dialog = MultipleLinesInputDialog.dialog([
      {
        key: 'tagName',
        label: '?????????',
        placeholder: 'v1.0.0',
      },
      {
        key: 'description',
        label: '??????',
        placeholder: '????????????',
      },
    ])
    dialog.title = '????????????'
    dialog.show(async (params: any) => {
      const request = MyAxios(new CommonAPI(ModelMilestoneApis.ModelMilestoneCreate, this.modelKey))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('????????????')
      this.reloadMilestoneList()
    })
  }

  async onImportMilestone() {
    const dialog = JsonImportDialog.dialog()
    dialog.show(async (params) => {
      const request = MyAxios(new CommonAPI(ModelMilestoneApis.ModelMilestoneImport, this.modelKey))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('????????????')
      this.reloadMilestoneList()
    })
  }
}

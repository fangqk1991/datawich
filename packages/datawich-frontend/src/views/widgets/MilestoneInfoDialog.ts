import { Component } from 'vue-property-decorator'
import { AlertTools, ConfirmDialog, CustomDialog, CustomDialogView } from '@fangcha/vue'
import {
  GeneralDataFormatter,
  ModelFieldModel,
  ModelFullMetadata,
  ModelMilestoneModel,
} from '@web/datawich-common/models'
import { CommonAPI } from '@fangcha/app-request'
import { ModelFieldApis, ModelMilestoneApis } from '@web/datawich-common/web-api'
import { NotificationCenter } from 'notification-center-js'
import { MyAxios } from '@fangcha/vue/basic'
import { ModelStructurePanel } from '@fangcha/datawich-frontend'
import { DatawichEventKeys } from '../../services/DatawichEventKeys'

@Component({
  components: {
    'custom-dialog-view': CustomDialogView,
    'model-structure-panel': ModelStructurePanel,
  },
  template: `
    <custom-dialog-view ref="my-dialog" :title="title">
      <ul>
        <li>标签名: {{ milestone.tagName }}</li>
        <li>描述: {{ milestone.description }}</li>
        <li>元信息: <a :href="downloadUri" target="_blank">点击下载</a></li>
        <li>创建时间: {{ milestone.createTime }}</li>
        <li v-if="milestone.tagName !== 'master'">
          <span>操作: </span><a class="text-danger" href="javascript:" @click="onRestoreMilestone">还原到模型</a>
          <!--          操作: <a class="text-danger" href="javascript:" @click="onRemoveMilestone">删除</a>-->
        </li>
      </ul>
      <model-structure-panel v-if="metadata" class="my-2 bordered-content" :metadata="metadata" />
    </custom-dialog-view>
  `,
})
export class MilestoneInfoDialog extends CustomDialog {
  milestone!: ModelMilestoneModel
  metadata: ModelFullMetadata | null = null

  constructor() {
    super()
  }

  async viewDidLoad() {
    this.title = `Tag: ${this.milestone.tagName}`

    const request = MyAxios(
      new CommonAPI(ModelMilestoneApis.ModelMilestoneMetadataGet, this.milestone.modelKey, this.milestone.tagName)
    )
    this.metadata = await request.quickSend()
  }

  static dialog(milestone: ModelMilestoneModel) {
    const dialog = new MilestoneInfoDialog()
    dialog.milestone = milestone
    return dialog
  }

  get downloadUri() {
    const commonApi = new CommonAPI(
      ModelMilestoneApis.ModelMilestoneMetadataGet,
      this.milestone.modelKey,
      this.milestone.tagName
    )
    return commonApi.api
  }

  async onRestoreMilestone() {
    const modelKey = this.milestone.modelKey
    const dialog = ConfirmDialog.strongDialog()
    dialog.title = '还原版本'
    dialog.content = `确定要将 "${this.milestone.tagName}" 字段结构还原到模型吗？<b class="text-danger">（模型数据将会丢失）</b>`
    dialog.show(async () => {
      const metadata = this.metadata!

      {
        const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldListGet, modelKey))
        const items = (await request.quickSend()) as ModelFieldModel[]
        const fields = items.filter((item) => !item.isSystem)
        this.$message.success('成功获取现有模型字段列表')
        for (let i = 0; i < fields.length; ++i) {
          const field = fields[i]
          const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldDelete, modelKey, field.fieldKey))
          await request.execute()
          this.$message.success(`已删除 ${field.name}(${field.fieldKey})，进度 ${i + 1} / ${fields.length}`)
        }
      }
      {
        this.$message.success(`正在还原 ${metadata.tagName} 字段`)
        const fields = metadata.modelFields.filter((item) => !item.isSystem)
        for (let i = 0; i < fields.length; ++i) {
          const field = GeneralDataFormatter.formatModelField(fields[i])
          const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldCreate, modelKey))
          request.setBodyData(field)
          await request.execute()
          this.$message.success(`已创建 ${field.name}(${field.fieldKey})，进度 ${i + 1} / ${fields.length}`)
        }
      }

      AlertTools.showConfirm(`版本还原成功，是否刷新页面`).then(() => {
        window.location.reload()
      })
    })
  }

  async onRemoveMilestone() {
    const dialog = new ConfirmDialog()
    dialog.title = '移除版本'
    dialog.content = `确定要移除 "${this.milestone.tagName}" 吗？`
    dialog.show(async () => {
      const request = MyAxios(
        new CommonAPI(ModelMilestoneApis.ModelMilestoneDelete, this.milestone.modelKey, this.milestone.tagName)
      )
      await request.execute()
      this.$message.success('移除成功')

      NotificationCenter.defaultCenter().postNotification(
        DatawichEventKeys.kOnDataModelMilestonesNeedReload,
        this.milestone.modelKey
      )
    })
  }
}

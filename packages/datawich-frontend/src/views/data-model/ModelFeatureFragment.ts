import { Component, MySwitch, SimpleInputDialog } from '@fangcha/vue'
import { DataModelApis } from '@web/datawich-common/web-api'
import { NotificationCenter } from 'notification-center-js'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { ModelFragmentBase } from './ModelFragmentBase'
import { EmailEditDialog } from '../widgets/EmailEditDialog'
import { DatawichEventKeys } from '../../services/DatawichEventKeys'
import { DataRecordEventDescriptor, ModelNotifyTemplateModel } from '@web/datawich-common/models'

@Component({
  components: {
    'my-switch': MySwitch,
  },
  template: `
    <div v-if="dataModel">
      <el-form label-position="left" label-width="120px">
        <el-form-item class="card-form-item" label="企业微信 Bot">
          <a v-if="dataModel.wechatbotKey" href="javascript:" @click="onWechatBotChanged">修改企业微信机器人 key 值</a>
          <a v-else href="javascript:" @click="onWechatBotChanged">添加企业微信机器人 key 值</a>
        </el-form-item>
        <el-form-item class="card-form-item">
          <template v-slot:label>
            是否开启广播
            <el-tooltip class="item" effect="dark" placement="top">
              <span class="el-icon-question" />
              <div slot="content">
                本功能使用企业微信机器人推送消息<br />需要先在企业微信中配置。详情参考
                <a href="https://work.weixin.qq.com/help?doc_id=13376">官方文档</a>,
                使用广播功能时需要先添加 key 值，否则无法开启
              </div>
            </el-tooltip>
          </template>
          <my-switch v-model="dataModel.isBroadcast" @change="onBroadcastChanged" />
        </el-form-item>
        <el-form-item v-if="dataModel.isBroadcast" class="card-form-item">
          <template v-slot:label>
            消息模板
            <el-tooltip class="item" effect="dark" placement="top">
              <span class="el-icon-question" />
              <div slot="content">
                该字段用于编辑在 agolet 中广播消息的格式,字段管理中可选择广播字段,默认样式为 fieldName: {{ wrapVar('fieldKey') }}<br />
                {{ wrapVar('xxx') }} 表示字段 key 对应数据，请确保需要广播的字段 key 存在花括号中<br />
                关联外键数据需使用 {{ wrapVar('current_key.model_name.foreign_key') }} 的格式, 例:<br />
                <p>一条预警信息,  请及时前往 {{ wrapVar('DataAppLink') }} 查看详细信息 <br/>
                  公司 ID: {{ wrapVar('company_id') }}<br /></p>
                {{ wrapVar('DataAppLink') }}字段表示此应用的地址
              </div>
            </el-tooltip>
          </template>
          <a href="javascript:" @click="onEditModelTemplate">编辑</a>
          <div class="bordered-content">
            <pre v-if="notifyTemplate" class="my-pre">{{ notifyTemplate.content }}</pre>
          </div>
        </el-form-item>
        <el-form-item v-if="dataModel.isBroadcast" class="card-form-item">
          <template v-slot:label>
            广播行为配置
          </template>
          <el-checkbox-group v-model="broadcastEventList" @change='onBroadcastEventChanged'>
            <el-checkbox v-for='option in dataRecordEventOptions' :key="option.value" :label='option.value' :value='option.value'></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item class="card-form-item">
          <template v-slot:label>
            邮件通知
            <el-tooltip class="item" effect="dark" placement="top">
              <span class="el-icon-question" />
              <div slot="content">
                开启后，数据行中会展示「发送邮件」功能按钮
              </div>
            </el-tooltip>
          </template>
          <my-switch v-model="dataModel.useEmail" @change="onUseEmailChanged" />
        </el-form-item>
        <el-form-item v-if="dataModel.useEmail" class="card-form-item" label="邮件信息">
          <a href="javascript:" @click="onEditEmailTemplate">编辑</a>
        </el-form-item>
      </el-form>
    </div>
  `,
})
export class ModelFeatureFragment extends ModelFragmentBase {
  notifyTemplate: ModelNotifyTemplateModel | null = null
  dataRecordEventOptions = DataRecordEventDescriptor.options()
  broadcastEventList: string[] = []
  async onLoadWidgetsInfo() {
    this.loadTemplateInfo()
    this.broadcastEventList = this.dataModel.extrasData.broadcastEventData
      ? Object.keys(this.dataModel.extrasData.broadcastEventData)
      : []
  }

  wrapVar(variable: string) {
    return `{{.${variable}}}`
  }

  viewDidLoad() {}

  async loadTemplateInfo() {
    const request = MyAxios(new CommonAPI(DataModelApis.DataModelNotifyTemplateGet, this.modelKey))
    this.notifyTemplate = await request.quickSend()
  }

  async onBroadcastChanged() {
    if (this.dataModel.wechatbotKey === '' && this.dataModel.isBroadcast) {
      await this.$message.error('请先添加微信机器人 key')
      this.dataModel.isBroadcast = 0
      return
    }
    const request = MyAxios(new CommonAPI(DataModelApis.DataModelUpdate, this.modelKey))
    request.setBodyData({ isBroadcast: this.dataModel.isBroadcast })
    request
      .execute()
      .then(() => {
        this.$message.success('更新成功')
        NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
      })
      .catch(() => {
        NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
      })
  }

  async onBroadcastEventChanged() {
    const request = MyAxios(new CommonAPI(DataModelApis.DataModelUpdate, this.modelKey))
    const dataModel = this.dataModel
    request.setBodyData({
      extrasData: {
        ...dataModel.extrasData,
        broadcastEventData: this.broadcastEventList.reduce((result, cur) => {
          result[cur] = true
          return result
        }, {}),
      },
    })
    request
      .execute()
      .then(() => {
        this.$message.success('更新成功')
        NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
      })
      .catch(() => {
        NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
      })
  }

  async onEditModelTemplate() {
    const dialog = SimpleInputDialog.textareaDialog()
    dialog.placeholder = '模板内容'
    dialog.content = this.notifyTemplate!.content
    dialog.show(async (content: string) => {
      await this.execHandler(async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.DataModelNotifyTemplateUpdate, this.modelKey))
        request.setBodyData({ content: content })
        await request.execute()
        this.$message.success('更新成功')
        this.loadTemplateInfo()
      })
    })
  }

  async onWechatBotChanged() {
    const dialog = new SimpleInputDialog()
    dialog.placeholder = '企业微信机器人 key 值'
    dialog.content = this.dataModel.wechatbotKey
    dialog.show(async (wechatbotKey: string) => {
      await this.execHandler(async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.DataModelUpdate, this.modelKey))
        request.setBodyData({ wechatbotKey: wechatbotKey })
        await request.execute()
        this.$message.success('更新成功')
        NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
      })
    })
  }

  onUseEmailChanged() {
    const request = MyAxios(new CommonAPI(DataModelApis.DataModelUpdate, this.modelKey))
    request.setBodyData({ useEmail: this.dataModel.useEmail })
    request
      .execute()
      .then(() => {
        this.$message.success('更新成功')
        NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
      })
      .catch(() => {
        NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
      })
  }

  onEditEmailTemplate() {
    const dialog = EmailEditDialog.dialogForEdit(this.modelKey)
    dialog.show(async (emailEntity) => {
      await this.execHandler(async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.DataModelNotifyTemplateUpdate, this.modelKey))
        request.setBodyData({ emailEntityStr: JSON.stringify(emailEntity) })
        await request.execute()
        this.$message.success('更新成功')
      })
    })
  }
}

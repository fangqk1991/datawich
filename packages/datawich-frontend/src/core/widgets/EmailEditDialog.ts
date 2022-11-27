import { Component } from 'vue-property-decorator'
import { HtmlDisplayPanel, StringListPanel, TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import { DataAppApis, DataModelApis } from '@fangcha/datawich-service/lib/common/web-api'
import { EmailEntityModel, ModelNotifyTemplateModel } from '@fangcha/datawich-service/lib/common/models'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
    'string-list-panel': StringListPanel,
    'html-display-panel': HtmlDisplayPanel,
  },
  template: `
    <typical-dialog-view ref="my-dialog" :title="title" :callback="callback" width="70%">
      <el-form v-loading="isLoading" size="mini" label-width="170px" label-position="left" class="mt-4">
        <el-form-item class="card-form-item mt-2" label="收件邮箱">
          <string-list-panel v-model="emailEntity.receiverList" />
        </el-form-item>
        <el-form-item class="card-form-item mt-2" label="抄送邮箱(使用逗号或分隔)">
          <el-input v-model="ccReceiverListStr" type="textarea" :rows="2"></el-input>
        </el-form-item>
        <el-form-item class="card-form-item mt-2" label="邮件标题模板">
          <el-input v-if="forPreview" v-model="emailEntity.title" type="textarea" :rows="2"></el-input>
          <el-input v-else v-model="emailEntity.title" type="textarea" :rows="2"></el-input>
        </el-form-item>
        <el-form-item class="card-form-item mt-2">
          <template v-slot:label>
            <span v-if="!forPreview">邮件模板</span>
            <span v-else>邮件内容预览</span>
            <el-tooltip class="item" effect="dark" placement="top">
              <div slot="content">
                1. 邮件模板使用 HTML 代码生成, 初始化已生成通用模板，相关教程请见
                <a href="https://www.runoob.com/html/html-tables.html">表格教程</a><br />
                2. {{ wrapVar('xxx') }} 表示字段 key 对应数据，请确保需要广播的字段 key 存在花括号中<br />
                关联外键数据需使用 {{ wrapVar('current_key.model_name.foreign_key') }} 的格式
              </div>
              <span class="el-icon-question"></span>
            </el-tooltip>
          </template>
          <html-display-panel v-model="emailEntity.contentTemplate" :show-iframe="true" :editable="!forPreview" />
        </el-form-item>
      </el-form>
    </typical-dialog-view>
  `,
})
export class EmailEditDialog extends TypicalDialog {
  title: string = '邮件信息编辑'
  modelKey = ''
  ccReceiverListStr = ''
  emailEntity: EmailEntityModel = {
    receiverList: [],
    ccReceiverList: [],
    title: '',
    contentTemplate: '',
  }
  dataId = ''
  forPreview = false
  defaultTemplate = [
    `<table border="1" width="90%" cellpadding="10" cellspacing="0" align="center">`,
    `    <tr>`,
    `        <th style="width:20%">表头1</th>`,
    `        <th style="width:80%">表头2</th>`,
    `    </tr>`,
    `    <tr>`,
    `        <td>内容1: Info</td>`,
    `        <td>内容2: {{.abc}}</td>`,
    `    </tr>`,
    `</table>`,
  ]

  wrapVar(variable: string) {
    return `{{.${variable}}}`
  }

  constructor() {
    super()
  }

  viewDidLoad() {
    this.loadData()
  }

  async loadData() {
    if (!this.forPreview) {
      const request = MyAxios(new CommonAPI(DataModelApis.DataModelNotifyTemplateGet, this.modelKey))
      const template = (await request.quickSend()) as ModelNotifyTemplateModel
      if (template.emailEntityStr) {
        this.emailEntity = JSON.parse(template.emailEntityStr) as EmailEntityModel
      } else {
        this.emailEntity.contentTemplate = this.defaultTemplate.join('\n')
      }
      this.ccReceiverListStr = this.emailEntity.ccReceiverList.join(',')
    } else {
      const request = MyAxios(new CommonAPI(DataAppApis.DataAppRecordNotifyTemplateGet, this.modelKey, this.dataId))
      const template = (await request.quickSend()) as ModelNotifyTemplateModel
      if (template.emailEntityStr) {
        this.emailEntity = JSON.parse(template.emailEntityStr) as EmailEntityModel
      } else {
        this.emailEntity.contentTemplate = this.defaultTemplate.join('\n')
      }
      this.ccReceiverListStr = this.emailEntity.ccReceiverList.join(',')
    }
  }

  static dialogForEdit(modelKey: string) {
    const dialog = new EmailEditDialog()
    dialog.modelKey = modelKey
    return dialog
  }

  static dialogForPreview(modelKey: string, dataId: string) {
    const dialog = new EmailEditDialog()
    dialog.modelKey = modelKey
    dialog.forPreview = true
    dialog.dataId = dataId
    return dialog
  }

  onHandleResult() {
    this.emailEntity.ccReceiverList = this.ccReceiverListStr.split(/[,;]/).map((email) => email.trim())
    return this.emailEntity
  }
}

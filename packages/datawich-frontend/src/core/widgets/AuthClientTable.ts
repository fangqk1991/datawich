import { Component, ConfirmDialog, MyTableView, Prop, ViewController } from '@fangcha/vue'
import { ClientAuthModel, ModelClientModel } from '@fangcha/datawich-service/lib/common/models'
import { DatawichClientApis, ModelClientApis } from '@fangcha/datawich-service/lib/common/web-api'
import { SelectOption } from '@fangcha/tools'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'

@Component({
  components: {
    'my-table-view': MyTableView,
  },
  template: `
    <div>
      <h3>API Key 管理</h3>
      <div>
        <common-picker v-model="curAppid" :options="clientOptions" size="mini" empty-title="请选择" filterable />
        <el-button size="mini" type="primary" @click="onAddClient">添加</el-button>
      </div>
      <div style="line-height: 2;">
        <el-tag
          v-for="client in authClientList"
          :key="client.appid"
          size="small"
          closable
          @close="onRemoveClient(client)"
          >{{ client.appid }}
        </el-tag>
      </div>
    </div>
  `,
})
export class AuthClientTable extends ViewController {
  @Prop({ default: '', type: String }) readonly modelKey!: string

  clientOptions: SelectOption[] = []
  authClientList: ClientAuthModel[] = []
  curAppid = ''

  viewDidLoad() {
    this.reloadClientList()
    this.loadAllClients()
  }

  async loadAllClients() {
    const request = MyAxios(DatawichClientApis.ModelClientListGet)
    request.setQueryParams({ _length: 10000 })
    const { elements: clients } = (await request.quickSend()) as {
      elements: ModelClientModel[]
    }
    this.clientOptions = clients.map((item) => {
      return {
        value: item.appid,
        label: `${item.name}[${item.appid}]`,
      }
    })
  }

  async reloadClientList() {
    await this.execHandler(async () => {
      const request = MyAxios(new CommonAPI(ModelClientApis.ModelAuthClientListGet, this.modelKey))
      this.authClientList = await request.quickSend()
    })
  }

  async onRemoveClient(client: ClientAuthModel) {
    const dialog = new ConfirmDialog()
    dialog.title = '移除 appid'
    dialog.content = `确定要移除 "${client.appid}" 吗？`
    dialog.show(async () => {
      const request = MyAxios(new CommonAPI(ModelClientApis.ModelAuthClientDelete, this.modelKey, client.appid))
      await request.execute()
      this.$message.success('移除成功')
      this.reloadClientList()
    })
  }

  async onAddClient() {
    if (!this.curAppid) {
      return
    }
    await this.execHandler(async () => {
      const request = MyAxios(new CommonAPI(ModelClientApis.ModelAuthClientListUpdate, this.modelKey))
      request.setBodyData([
        {
          modelKey: this.modelKey,
          appid: this.curAppid,
          checked: true,
        },
      ])
      await request.execute()
      this.$message.success('添加成功')
      this.reloadClientList()
    })
  }
}

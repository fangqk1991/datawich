import { Component, GridView, TableViewProtocol, ViewController } from '@fangcha/vue'
import { DataAppApis } from '@fangcha/datawich-service/lib/common/web-api'
import { MyAxios } from '@fangcha/vue/basic'
import { DataAppCard } from './DataAppCard'

@Component({
  components: {
    'grid-view': GridView,
    'data-app-card': DataAppCard,
  },
  template: `
    <div>
      <h2>数据应用列表</h2>
      <grid-view ref="tableView" :delegate="delegate" class="mt-4" style="line-height: 3">
        <data-app-card slot-scope="scope" :data="scope.data" class="mr-2" />
      </grid-view>
    </div>
  `,
})
export class DataAppListView extends ViewController {
  async viewDidLoad() {
    this.tableView().resetFilter(true)
  }

  tableView() {
    return this.$refs.tableView as GridView
  }

  get delegate(): TableViewProtocol {
    return {
      loadOnePageItems: async (_retainParams) => {
        // const params: any = {
        //   ...retainParams,
        //   level: this.filterParams['level'],
        // }
        const request = MyAxios(DataAppApis.DataAppListGet)
        return request.quickSend()
      },
    }
  }
}

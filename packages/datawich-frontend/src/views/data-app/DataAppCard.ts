import { Component, Prop, ViewController } from '@fangcha/vue'
import { DataModelModel } from '@web/datawich-common/models'
import { getRouterToDataApp } from '../../services/ModelDataHelper'

@Component({
  template: `
    <router-link :to="routeToDataApp">
      <el-button>
        {{ data.name }}
        <el-tooltip
          class="item"
          effect="dark"
          placement="top"
        >
          <ul slot="content">
            <li>{{ data.accessLevel | describe_model_access_level_detail }}</li>
            <li>modelKey: {{ data.modelKey }}</li>
            <li>维护者: {{ data.author }}</li>
          </ul>
          <span class="el-icon-question" />
        </el-tooltip>
      </el-button>
    </router-link>
  `,
})
export class DataAppCard extends ViewController {
  @Prop({ default: null, type: Object }) readonly data!: DataModelModel

  get routeToDataApp() {
    return getRouterToDataApp(this.data)
  }
}

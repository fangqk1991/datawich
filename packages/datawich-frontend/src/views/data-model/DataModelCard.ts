import { Component, Prop, ViewController } from '@fangcha/vue'
import { DataModelModel } from '@fangcha/datawich-service'
import { getRouterToDataApp, getRouterToModel } from '../../services/ModelDataHelper'

@Component({
  template: `
    <div class="fc-card" style="width: 300px; ">
      <h5 class="fc-single-line">
        {{ data.name }}
        <el-tooltip
          class="item"
          effect="dark"
          placement="top"
        >
          <ul slot="content">
            <li>modelKey: {{ data.modelKey }}</li>
            <li>维护者: {{ data.author }}</li>
          </ul>
          <small class="el-icon-question" />
        </el-tooltip>
      </h5>
      <ul class="fc-clean-ul">
        <li>
          <span v-if="data.isOnline" style="color: #67C23A">已发布 <i class="el-icon-success"/></span>
          <span v-if="!data.isOnline" style="color: #F56C6C">未发布 <i class="el-icon-error"/></span>
          <el-tag v-if="data.isRetained" size="mini" type="danger">系统保留</el-tag>
          <el-tag v-if="data.isLibrary" size="mini">可关联</el-tag>
          <el-tag v-for="name in data.tagList" :key="name" size="mini" type="danger">
            {{ name }}
          </el-tag>
        </li>
        <li>
          <el-tooltip
            class="item"
            effect="dark"
            placement="top"
          >
            <div slot="content">
              {{ data.accessLevel | describe_model_access_level_detail }}
            </div>
            <span>
              {{ data.accessLevel | describe_model_access_level }}
              <i class="el-icon-question" />
            </span>
          </el-tooltip>
          |
          <template v-if="count === null">
            加载中……
          </template>
          <b v-else>
            {{ count }} 条记录
          </b>
        </li>
        <li>
          <router-link :to="routeToDataModel">{{ LS('[i18n] Manage Model') }}</router-link>
          |
          <router-link :to="routeToDataApp">{{ LS('[i18n] View App') }}</router-link>
        </li>
      </ul>
    </div>
  `,
})
export class DataModelCard extends ViewController {
  @Prop({ default: null, type: Object }) readonly data!: DataModelModel
  @Prop({ default: null, type: Number }) readonly count!: number | null

  get routeToDataApp() {
    return getRouterToDataApp(this.data)
  }

  get routeToDataModel() {
    return getRouterToModel(this.data.modelKey)
  }
}

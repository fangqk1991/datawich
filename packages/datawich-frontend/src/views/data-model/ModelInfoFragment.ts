import { DataModelModel } from '@fangcha/datawich-service'
import { Component, ConfirmDialog, SimpleInputDialog } from '@fangcha/vue'
import { DataModelApis } from '@web/datawich-common/admin-apis'
import { NotificationCenter } from 'notification-center-js'
import { CommonAPI } from '@fangcha/app-request'
import { MyAxios } from '@fangcha/vue/basic'
import { ModelFragmentBase } from './ModelFragmentBase'
import { DataModelDialog } from '../widgets/DataModelDialog'
import { DatawichEventKeys } from '../../services/DatawichEventKeys'
import { getRouterToDataApp, getRouterToModel } from '../../services/ModelDataHelper'

@Component({
  template: `
    <div v-if="dataModel">
      <el-card shadow="never">
        <h3>
          <span>{{ dataModel.name }}</span>
        </h3>
        <el-form label-position="left" label-width="120px">
          <el-form-item class="card-form-item" label="操作">
            <a href="javascript:" @click="onEditModel">编辑</a>
            |
            <a href="javascript:" @click="onCloneModel">克隆</a>
            |
            <a href="javascript:" class="text-danger" @click="onEmptyData">清空数据</a>
            |
            <a href="javascript:" class="text-danger" @click="onDeleteModel">删除模型</a>
          </el-form-item>
          <el-form-item class="card-form-item" label="模型 Key">
            {{ dataModel.modelKey }}
          </el-form-item>
          <el-form-item class="card-form-item" label="标识符">
            {{ dataModel.shortKey }}
          </el-form-item>
          <el-form-item class="card-form-item" label="模型名称">
            <span>{{ dataModel.name }}</span>
          </el-form-item>
          <el-form-item class="card-form-item" label="模型描述">
            <div v-if="dataModel.description" class="bordered-content">
              <pre class="my-pre">{{ dataModel.description }}</pre>
            </div>
          </el-form-item>
          <el-form-item class="card-form-item" label="是否发布">
            <span v-if="dataModel.isOnline" style="color: #67C23A">已发布 <i class="el-icon-success" /></span>
            <span v-if="!dataModel.isOnline" style="color: #F56C6C">未发布 <i class="el-icon-error" /></span>
          </el-form-item>
          <el-form-item class="card-form-item" label="模型可见性">
            <span>{{ dataModel.accessLevel | describe_model_access_level_detail }}</span>
          </el-form-item>
          <el-form-item class="card-form-item" label="模型关联性">
            <span v-if="dataModel.isLibrary">本模型的 Unique 字段可被其他模型外键关联</span>
            <span v-if="!dataModel.isLibrary">本模型不可被其他模型关联</span>
          </el-form-item>
          <el-form-item class="card-form-item" label="维护者">
            {{ dataModel.author }}
          </el-form-item>
          <el-form-item class="card-form-item" label="概要信息"> 共 {{ summaryInfo.count }} 条记录 </el-form-item>
          <el-form-item class="card-form-item" label="数据保护">
            <el-tag v-if="dataModel.isDataInsertable" size="mini">可添加</el-tag>
            <el-tag v-else type="info" size="mini">不可添加</el-tag>
            <el-tag v-if="dataModel.isDataModifiable" size="mini">可修改</el-tag>
            <el-tag v-else type="info" size="mini">不可修改</el-tag>
            <el-tag v-if="dataModel.isDataDeletable" size="mini">可删除</el-tag>
            <el-tag v-else type="info" size="mini">不可删除</el-tag>
          </el-form-item>
          <el-form-item class="card-form-item" label="数据摘要">
            {{ dataModel.extrasData.dataInfoTmpl }}
            | <a href="javascript:" @click="onEditDataInfoTmpl">编辑</a>
          </el-form-item>
          <el-form-item class="card-form-item" label="更新时间">
            {{ dataModel.updateTime }}
          </el-form-item>
          <el-form-item class="card-form-item" label="应用地址">
            <router-link :to="routeToDataApp()"> 点击查看 </router-link>
          </el-form-item>
        </el-form>
        <div v-if="outerModels.length > 0" class="mt-4" style="line-height: 2">
          <h5>以下模型在引用本模型</h5>
          <router-link v-for="model in outerModels" :key="model.modelKey" :to="routerToModel(model)" class="mr-2">
            <el-button size="mini">{{ model.name }}</el-button>
          </router-link>
        </div>
      </el-card>
      <hr class="my-3" />
    </div>
  `,
})
export class ModelInfoFragment extends ModelFragmentBase {
  outerModels: DataModelModel[] = []
  summaryInfo = {
    count: 0,
  }

  routeToDataApp() {
    return getRouterToDataApp(this.dataModel)
  }

  routerToModel(model: DataModelModel) {
    return getRouterToModel(model.modelKey)
  }

  async loadOuterModels() {
    if (this.dataModel.isLibrary) {
      const request = MyAxios(new CommonAPI(DataModelApis.DataModelOuterModelListGet, this.modelKey))
      this.outerModels = (await request.quickSend()) as DataModelModel[]
    }
  }

  async onLoadWidgetsInfo() {
    this.loadOuterModels()
    {
      const request = MyAxios(new CommonAPI(DataModelApis.DataModelSummaryInfoGet, this.modelKey))
      this.summaryInfo = await request.quickSend()
    }
  }

  onCloneModel() {
    const dialog = new SimpleInputDialog()
    dialog.placeholder = '模型 Key'
    dialog.show(async (modelKey: string) => {
      await this.execHandler(async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.DataModelClone, this.modelKey))
        request.setBodyData({ to_key: modelKey })
        await request.execute()
        this.$message.success('克隆成功，跳转中……')

        await this.$router.push({
          name: 'DataModelManageView',
          params: {
            modelKey: modelKey,
          },
        })
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      })
    })
  }

  onEmptyData() {
    const dialog = ConfirmDialog.strongDialog()
    dialog.title = '清空数据'
    dialog.content = `确定要清空 "${this.dataModel.name}" 的所有数据吗？`
    dialog.show(async () => {
      await this.execHandler(async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.DataModelRecordsEmpty, this.modelKey))
        await request.execute()
        this.$message.success('数据已清空')
        NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
      })
    })
  }

  onEditModel() {
    const dialog = DataModelDialog.editModelDialog(this.dataModel)
    dialog.show(async (params: any) => {
      const request = MyAxios(new CommonAPI(DataModelApis.DataModelUpdate, this.modelKey))
      request.setBodyData(params)
      await request.execute()
      this.$message.success('更新成功')
      NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
    })
  }

  onEditDataInfoTmpl() {
    const dialog = SimpleInputDialog.textInputDialog()
    dialog.title = '编辑摘要模板'
    dialog.description = '请使用 {{.xxxx}} 表示变量'
    dialog.content = this.dataModel.extrasData.dataInfoTmpl || ''
    dialog.show(async (dataInfoTmpl) => {
      const request = MyAxios(new CommonAPI(DataModelApis.DataModelUpdate, this.modelKey))
      request.setBodyData({
        extrasData: {
          dataInfoTmpl: dataInfoTmpl,
        },
      })
      await request.execute()
      this.$message.success('更新成功')
      NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnDataModelNeedReload, this.modelKey)
    })
  }

  onDeleteModel() {
    const dialog = ConfirmDialog.strongDialog()
    dialog.title = '删除模型'
    dialog.content = `确定要删除 "${this.dataModel.name}" 吗？`
    dialog.show(async () => {
      await this.execHandler(async () => {
        const request = MyAxios(new CommonAPI(DataModelApis.DataModelDelete, this.dataModel.modelKey))
        await request.execute()
        this.$message.success('删除成功')
        this.$router.push({
          name: 'DataModelListView',
        })
      })
    })
  }
}

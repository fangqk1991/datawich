import { Component, Prop, ViewController } from '@fangcha/vue'
import { CommonAPI } from '@fangcha/app-request'
import { DataImportPanel, DataImportProtocol } from '@fangcha/vue/oss-service'
import { MyAxios } from '@fangcha/vue/basic'
import { TagsContainer, MultiEnumContainer } from '@fangcha/datawich-frontend'
import { DataModelModel, ModelFieldModel, FieldType } from '@fangcha/datawich-service'
import { DataAppApis } from '@web/datawich-common/web-api'

@Component({
  components: {
    'tags-container': TagsContainer,
    'data-import-panel': DataImportPanel,
    'multi-enum-container': MultiEnumContainer,
  },
  template: `
    <div>
      <h4>导入数据</h4>
      <ul>
        <li>常规情况下，导入的数据行均会被<b class="text-info">创建</b></li>
        <li>若导入的数据行存在 rid (自增序号，主键)，相关行数据将被<b class="text-info">更新</b></li>
        <li>rid 字段默认不展示，可以在「管理系统字段」中勾选以展示</li>
      </ul>
      <data-import-panel :delegate="dataImportDelegate" success-text="已导入" fail-text="导入失败">
        <el-tooltip slot="sample-tooltip" class="item" effect="dark" placement="top">
          <span class="question_icon el-icon-question" />
          <div slot="content">
            版本: {{ dataModel.version }}<br />
            最近更新: {{ dataModel.updateTime | ISO8601 }}
          </div>
        </el-tooltip>
        <template v-for="field in fields">
          <el-table-column v-if="field.fieldType === FieldType.TextEnum" :prop="field.fieldKey">
            <template v-slot:header>
              {{ field.name }}
            </template>
            <template slot-scope="scope">
              {{ field.value2LabelMap[scope.row[field.fieldKey]] }}
              <el-tooltip v-if="!checkCellValid(scope.row, field.fieldKey)" class="item" effect="dark" placement="top">
                <span class="question_icon el-icon-question" />
                <div slot="content">
                  {{ scope.row.invalidMap[field.fieldKey] }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column v-else-if="field.fieldType === FieldType.MultiEnum" :prop="field.fieldKey">
            <template v-slot:header>
              {{ field.name }}
            </template>
            <template slot-scope="scope">
              <multi-enum-container :options="field.options" :value="scope.row[field.fieldKey]" />
              <el-tooltip v-if="!checkCellValid(scope.row, field.fieldKey)" class="item" effect="dark" placement="top">
                <span class="question_icon el-icon-question" />
                <div slot="content">
                  {{ scope.row.invalidMap[field.fieldKey] }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column v-else :label="field.name" :prop="field.fieldKey">
            <template slot-scope="scope">
              {{ scope.row[field.fieldKey] }}
              <el-tooltip v-if="!checkCellValid(scope.row, field.fieldKey)" class="item" effect="dark" placement="top">
                <span class="question_icon el-icon-question" />
                <div slot="content">
                  {{ scope.row.invalidMap[field.fieldKey] }}
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
        </template>
      </data-import-panel>
    </div>
  `,
})
export class GeneralDataImportPanel extends ViewController {
  @Prop({ default: null, type: Object }) readonly dataModel!: DataModelModel
  @Prop({ default: () => [], type: Array }) readonly fields!: ModelFieldModel[]

  FieldType = FieldType

  viewDidLoad() {}

  checkCellValid(data: any, columnKey: string) {
    const invalidMap = data['invalidMap'] || {}
    return !invalidMap[columnKey]
  }

  get dataImportDelegate(): DataImportProtocol<any> {
    const commonAPI = new CommonAPI(DataAppApis.DataAppExcelDemoDownload, this.dataModel.modelKey)
    return {
      sampleFileURL: commonAPI.api,
      checkItemSuccess: (todoItem) => !!todoItem._data_id,
      checkItemFail: (todoItem) => todoItem.failed || Object.keys(todoItem['invalidMap'] || {}).length > 0,
      checkCellValid: (todoItem, prop) => {
        return this.checkCellValid(todoItem, prop)
      },
      onResourceUploaded: async (resourceId: string) => {
        const request = MyAxios(new CommonAPI(DataAppApis.DataAppPendingListGet, this.dataModel.modelKey, resourceId))
        return request.quickSend()
      },
      submitData: async (todoItem) => {
        const request = MyAxios(new CommonAPI(DataAppApis.DataAppRecordPut, this.dataModel.modelKey))
        request.setQueryParams({ forBatch: 1 })
        request.setBodyData(todoItem)
        await request.execute().catch(() => {})
      },
      onAllTasksSubmitted: (pickedItems) => {
        let succCount = 0
        let failCount = 0
        for (const item of pickedItems) {
          if (item['succ'] === 1) {
            ++succCount
          } else if (item['fail'] === 1) {
            ++failCount
          }
        }
        const request = MyAxios(new CommonAPI(DataAppApis.DataAppRecordsImportedCallback, this.dataModel.modelKey))
        request.setMute(true)
        request.setBodyData({ succCount: succCount, failCount: failCount })
        request.execute().catch(() => {})
        this.$emit('on-tasks-done')
      },
    }
  }
}

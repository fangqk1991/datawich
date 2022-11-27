import { Component } from 'vue-property-decorator'
import { TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import {
  DataModelModel,
  FieldLinkModel,
  inlineFieldDefaultName,
  LinkMapperInfo,
  ModelFieldModel,
} from '@fangcha/datawich-service/lib/common/models'
import { SelectOption } from '@fangcha/tools'
import { DataModelApis, ModelFieldApis } from '@fangcha/datawich-service/lib/common/web-api'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'

interface ReferenceInfo {
  refFields: ModelFieldModel[]
  fieldLinkMap: { [p: string]: LinkMapperInfo }
  openModelOptions: SelectOption[]
  openFieldOptions: SelectOption[]
}

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
  },
  template: `
    <typical-dialog-view :title="title" width="60%" :callback="callback">
      <el-form class="my-mini-form" label-width="120px" size="mini">
        <el-form-item label="当前模型字段" :required="true">
          <el-select v-model="data.fieldKey" :disabled="forEditing" style="width: 100%;">
            <el-option
              v-for="option in fieldsOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联模型" :required="true">
          <el-select v-model="data.refModel" :disabled="forEditing" style="width: 100%;" @change="onReferenceModelChanged">
            <el-option
              v-for="option in referenceInfo.openModelOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="外键指向" :required="true">
          <el-select v-model="data.refField" :disabled="forEditing" style="width: 100%;" @change="onReferenceFieldChanged">
            <el-option
              v-for="option in referenceInfo.openFieldOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内联到模型" :required="true">
          <el-radio-group v-model="data.isInline">
            <el-radio-button :key="1" :label="1">是</el-radio-button>
            <el-radio-button :key="0" :label="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <div class="mx-4 mt-2">
          <h5>关联模型内容</h5>
          <el-table
            :data="referenceInfo.refFields"
            size="mini"
            border
            :header-cell-style="{ 'background-color': '#fafafa' }"
          >
            <el-table-column label="字段键值" prop="fieldKey" width="120px" />
            <el-table-column label="字段名" prop="name" width="120px" show-overflow-tooltip />
            <el-table-column label="字段类型" width="120px" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.fieldType | describe_model_field_type }}
              </template>
            </el-table-column>
            <el-table-column label="是否选用" width="80px">
              <template slot-scope="scope">
                <el-switch v-model="referenceInfo.fieldLinkMap[scope.row.fieldKey].checked" />
              </template>
            </el-table-column>
            <el-table-column min-width="150px">
              <template v-slot:header>
                内联名称
                <el-tooltip class="item" effect="dark" placement="top">
                  <span class="el-icon-question" />
                  <div slot="content">
                    内联名称默认为 {本字段名}'s {外部字段名} 形式<br />
                    可根据需要自行调整 <br />
                    <br />
                    <el-button size="mini" type="primary" @click="useOuterFieldName">仅使用外部字段名</el-button>
                  </div>
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <el-input
                  v-model="referenceInfo.fieldLinkMap[scope.row.fieldKey].mappingName"
                  :placeholder="getRefFieldPlaceholder(scope.row)"
                  size="small"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>
    </typical-dialog-view>
  `,
})
export default class FieldLinkDialog extends TypicalDialog {
  modelKey: string = ''
  forEditing = false
  data: FieldLinkModel | any = {
    linkId: '',
    modelKey: '',
    fieldKey: '',
    refModel: '',
    refField: '',
    isForeignKey: 0,
    isInline: 0,
    referenceCheckedInfos: [],
  }
  fieldsOptions: SelectOption[] = []
  fieldMap: { [p: string]: ModelFieldModel } = {}

  constructor() {
    super()
  }

  static createLinkDialog(data?: FieldLinkModel) {
    const dialog = new FieldLinkDialog()
    dialog.title = '创建关联'
    if (data) {
      const newData: any = JSON.parse(JSON.stringify(data))
      delete newData.fieldKey
      dialog.data = newData
    }
    return dialog
  }

  static editLinkDialog(data: FieldLinkModel) {
    const dialog = new FieldLinkDialog()
    dialog.title = '编辑关联'
    dialog.forEditing = true
    dialog.data = JSON.parse(JSON.stringify(data))
    return dialog
  }

  onHandleResult() {
    this.data.referenceCheckedInfos = this.referenceInfo.refFields.map(
      (field) => this.referenceInfo.fieldLinkMap[field.fieldKey]
    )
    return this.data
  }

  referenceInfo: ReferenceInfo = {
    refFields: [],
    fieldLinkMap: {},
    openModelOptions: [],
    openFieldOptions: [],
  }

  viewDidLoad() {
    this.loadModelFields()
    this.loadOpenModels()
    if (this.data.refModel && this.data.refField) {
      this.reloadReferenceInfo().then(() => {
        const linkInfos: LinkMapperInfo[] = this.data.referenceCheckedInfos
        linkInfos.forEach((linkInfo) => {
          if (linkInfo.fieldKey in this.referenceInfo.fieldLinkMap) {
            this.referenceInfo.fieldLinkMap[linkInfo.fieldKey] = linkInfo
          }
        })
      })
    }
  }

  onReferenceModelChanged() {
    this.reloadReferenceInfo()
  }

  onReferenceFieldChanged() {
    this.referenceInfo.fieldLinkMap[this.data.refField].checked = true
  }

  async reloadReferenceInfo() {
    if (!this.data.refModel) {
      this.data.refField = ''
      this.referenceInfo.refFields = []
      this.referenceInfo.fieldLinkMap = {}
      return
    }
    const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelVisibleFieldListGet, this.data.refModel))
    const fields = (await request.quickSend()) as ModelFieldModel[]
    this.referenceInfo.refFields = fields
    this.referenceInfo.fieldLinkMap = {}
    for (const field of fields) {
      const linkInfo: LinkMapperInfo = {
        fieldKey: field.fieldKey,
        mappingName: '',
        checked: false,
      }
      this.$set(this.referenceInfo.fieldLinkMap, field.fieldKey, linkInfo)
    }
    const uniqueFields = this.referenceInfo.refFields.filter((field) => field.isUnique)
    this.referenceInfo.openFieldOptions = uniqueFields.map((field) => {
      return {
        label: `${field.modelKey} - ${field.name}`,
        value: field.fieldKey,
      }
    })
    this.data.refField = ''
    if (uniqueFields.length > 0 && !this.data.refField) {
      const field = uniqueFields[0]
      this.data.refField = field.fieldKey
    }
    this.referenceInfo.fieldLinkMap[this.data.refField].checked = true
  }

  async loadModelFields() {
    const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldListGet, this.modelKey))
    const items = (await request.quickSend()) as ModelFieldModel[]
    this.fieldMap = items.reduce((result, cur) => {
      result[cur.fieldKey] = cur
      return result
    }, {})
    this.fieldsOptions = items.map((model) => {
      return {
        label: `${model.fieldKey} - ${model.name}`,
        value: model.fieldKey,
      }
    })
  }

  async loadOpenModels() {
    const request = MyAxios(new CommonAPI(DataModelApis.DataOpenModelListGet))
    const openModels = (await request.quickSend()) as DataModelModel[]
    this.referenceInfo.openModelOptions = openModels
      .filter((model) => model.modelKey !== this.modelKey)
      .map((model) => {
        return {
          label: `${model.modelKey} - ${model.name}`,
          value: model.modelKey,
        }
      })
  }

  useOuterFieldName() {
    this.referenceInfo.refFields.forEach((field) => {
      if (this.referenceInfo.fieldLinkMap[field.fieldKey].checked) {
        this.referenceInfo.fieldLinkMap[field.fieldKey].mappingName = field.name
      }
    })
  }

  getRefFieldPlaceholder(field: ModelFieldModel) {
    const curField = this.fieldMap[this.data.fieldKey] || {}
    return inlineFieldDefaultName({ name: curField.name }, field)
  }
}

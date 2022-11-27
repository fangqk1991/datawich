import { Component } from 'vue-property-decorator'
import { TypicalDialog, TypicalDialogView } from '@fangcha/vue'
import {
  AccessLevel,
  AccessLevelDescriptor,
  DataModelModel,
  ModelType,
} from '@fangcha/datawich-service/lib/common/models'

@Component({
  components: {
    'typical-dialog-view': TypicalDialogView,
  },
  template: `
    <typical-dialog-view ref="my-dialog" :title="title" width="50%" :callback="callback">
    <el-form class="my-mini-form" size="mini" label-width="120px">
      <el-form-item label="模型 Key" :required="true">
        <el-input v-model="data.modelKey" type="text" style="width: 160px;" :disabled="forEditing">
        </el-input>
      </el-form-item>
      <el-form-item v-if="false" label="模型标识符">
        <el-input v-model="data.shortKey" type="text" style="width: 160px;">
        </el-input>
      </el-form-item>
      <el-form-item label="模型名称" :required="true">
        <el-input v-model="data.name" type="text" style="width: 160px;"></el-input>
      </el-form-item>
      <el-form-item label="模型描述" :required="false">
        <el-input v-model="data.description" :rows="3" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="备注" :required="false">
        <el-input v-model="data.remarks" type="text" style="width: 160px;"></el-input>
      </el-form-item>
      <el-form-item label="是否可导出" :required="true">
        <el-radio-group v-model="data.isDataExportable">
          <el-radio-button :key="1" :label="1">Yes</el-radio-button>
          <el-radio-button :key="0" :label="0">No</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否发布" :required="true">
        <el-radio-group v-model="data.isOnline">
          <el-radio-button :key="1" :label="1">已发布</el-radio-button>
          <el-radio-button :key="0" :label="0">未发布</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="可访问性" :required="false">
        <el-radio-group v-model="data.accessLevel">
          <el-radio-button
            v-for="accessLevel in accessLevelList"
            :key="accessLevel"
            :label="accessLevel">
            {{ accessLevel | describe_model_access_level }}
            <el-tooltip class="item" effect="dark" placement="top">
              <span class="el-icon-question" />
              <div slot="content">
                {{ accessLevel | describe_model_access_level_detail }}
              </div>
            </el-tooltip>
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否可关联" :required="false">
        <el-radio-group v-model="data.isLibrary">
          <el-radio-button :key="1" :label="1">可关联</el-radio-button>
          <el-radio-button :key="0" :label="0">不可关联</el-radio-button>
        </el-radio-group>
        <el-tooltip class="item" effect="dark" placement="top">
          <span class="el-icon-question" />
          <div slot="content">
            「可关联」意味着该模型的 Unique 字段可被其他模型外键关联
          </div>
        </el-tooltip>
      </el-form-item>
    </el-form>
    </typical-dialog-view>
  `,
})
export class DataModelDialog extends TypicalDialog {
  accessLevelList = AccessLevelDescriptor.values

  data: DataModelModel | any = {
    modelKey: '',
    shortKey: '',
    modelType: ModelType.NormalModel,
    accessLevel: AccessLevel.Protected,
    name: '',
    description: '',
    remarks: '',
    isOnline: 1,
    isLibrary: 0,
    isDataExportable: 0,
    star: 0,
  }
  forEditing = false

  constructor() {
    super()
  }

  viewDidLoad() {}

  static createModelDialog() {
    const dialog = new DataModelDialog()
    dialog.title = '创建模型'
    return dialog
  }

  static editModelDialog(data: DataModelModel) {
    const dialog = new DataModelDialog()
    dialog.title = '编辑模型'
    dialog.forEditing = true
    dialog.data = Object.assign({}, data)
    return dialog
  }

  onHandleResult() {
    return this.data
  }
}

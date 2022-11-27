import { Component, Watch } from 'vue-property-decorator'
import { CustomDialog, CustomDialogView } from '@fangcha/vue'
import {
  checkSpecialField,
  FieldType,
  FieldTypeDescriptor,
  ModelFieldExtrasData,
  ModelFieldModel,
} from '@fangcha/datawich-service/lib/common/models'
import EnumFieldExtension from './EnumFieldExtension'
import TagsFieldExtension from './TagsFieldExtension'
import { I18nCode } from '@fangcha/tools'

@Component({
  components: {
    'custom-dialog-view': CustomDialogView,
    'enum-field-extension': EnumFieldExtension,
    'tags-field-extension': TagsFieldExtension,
  },
  template: `
    <custom-dialog-view ref="my-dialog" :title="title" width="60%">
      <el-form class="my-mini-form" label-width="120px" size="mini">
        <el-form-item label="字段类型" :required="false">
          <el-radio-group v-model="useNormalField" :disabled="forEditing">
            <el-radio-button :key="true" :label="true">常规字段</el-radio-button>
            <el-radio-button :key="false" :label="false">特殊字段</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="字段类型" :required="true">
          <el-radio-group v-model="data.fieldType" :disabled="forEditing">
            <el-radio-button v-for="option in fieldTypeOptions" :key="option.value" :label="option.value" :disabled="option.disabled">
              {{ option.value | describe_model_field_type }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="字段 Key" :required="true">
          <el-input v-model="data.fieldKey" type="text" style="width: 200px;" :disabled="forEditing">
          </el-input>
        </el-form-item>
        <el-form-item label="字段名称" :required="true">
          <el-input v-model="data.name" type="text" style="width: 200px;"> </el-input>
        </el-form-item>
        <el-form-item v-if="forEditing" label="字段名(en)">
          <el-input v-model="data.nameI18n[I18nCode.en]" type="text" style="width: 200px;" />
        </el-form-item>
        <el-form-item v-if="forEditing" label="字段名(zh-Hans)">
          <el-input v-model="data.nameI18n[I18nCode.zhHans]" type="text" style="width: 200px;" />
        </el-form-item>
        <el-form-item v-if="!forBind" label="是否必填" :required="true">
          <el-radio-group v-model="data.required">
            <el-radio-button :key="1" :label="1">是</el-radio-button>
            <el-radio-button :key="0" :label="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <span slot="label">
            设置默认值
            <el-tooltip class="item" effect="dark" placement="top">
              <span class="el-icon-question" />
              <div slot="content">
                默认值仅用于前端默认填充，不涉及 DB 层面定义
              </div>
            </el-tooltip>
          </span>
          <el-radio-group v-model="data.useDefault">
            <el-radio-button :key="1" :label="1">是</el-radio-button>
            <el-radio-button :key="0" :label="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="data.useDefault" label="默认值" :required="false">
          <el-input v-model="data.defaultValue" type="text" style="width: 200px;"> </el-input>
        </el-form-item>
        <el-form-item v-if="isDateType">
          <span slot="label">
            可选范围
            <el-tooltip class="item" effect="dark" placement="top">
              <span class="el-icon-question" />
              <div slot="content">
                相对日期，比如 -1d 为昨日，+1d 为明日，+0d 为今日<br />
                绝对日期，yyyy-MM-dd，比如 2019-10-01
              </div>
            </el-tooltip>
          </span>
          <el-input v-model="data.dateRange.floor" type="text" placeholder="日期下限" style="width: 120px;"> </el-input>
          ~
          <el-input v-model="data.dateRange.ceil" type="text" placeholder="日期上限" style="width: 120px;"> </el-input>
        </el-form-item>
        <el-form-item label="正则约束">
          <el-input v-model="data.extrasData.matchRegex" type="text" style="width: 200px;">
          </el-input>
        </el-form-item>
        <el-form-item v-if="canBeSearchable" label="可搜索" :required="true">
          <el-radio-group v-model="data.searchable">
            <el-radio-button :key="1" :label="1">是</el-radio-button>
            <el-radio-button :key="0" :label="0">否</el-radio-button>
          </el-radio-group>
          <el-tooltip class="item" effect="dark" placement="top">
            <span class="el-icon-question" />
            <div slot="content">
              「可搜索」指的是用户在输入该字段数据时，会对数据库中现有的该字段数据进行模糊匹配，使用户能快速填写该值
            </div>
          </el-tooltip>
        </el-form-item>
        <enum-field-extension
          v-if="isEnumType"
          :data="data"
          :model-key="modelKey"
          :for-editing="forEditing"
        />
        <tags-field-extension
          v-if="isTagsType"
          :data="data"
          :model-key="modelKey"
          :for-editing="forEditing"
        />
      </el-form>
      <el-form v-if="forEditing" class="my-mini-form mt-3" label-width="120px" size="mini">
        <el-form-item label="Key 别名">
          <el-input v-model="data.keyAlias" type="text" style="width: 200px;">
          </el-input>
        </el-form-item>
        <el-form-item>
          <span slot="label">
            Readonly
            <el-tooltip class="item" effect="dark" placement="top">
              <span class="el-icon-question" />
              <div slot="content">
                用户不可在表单中进行输入/修改
              </div>
            </el-tooltip>
          </span>
          <el-radio-group v-model="data.extrasData.readonly">
            <el-radio-button :key="true" :label="true">True</el-radio-button>
            <el-radio-button :key="false" :label="false">False</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-checkbox v-if="!forBind && !forEditing && !copingFieldKey" v-model="continueToCreate" class="mr-2">继续添加</el-checkbox>
        <el-button size="small" @click="dismiss">{{ LS('Cancel') }}</el-button>
        <el-button size="small" type="primary" @click="onSubmit">{{ LS('Confirm') }}</el-button>
      </template>
    </custom-dialog-view>
  `,
})
export default class ModelFieldDialog extends CustomDialog {
  I18nCode = I18nCode

  useNormalField = true
  fullFieldTypeOptions = FieldTypeDescriptor.options()
  availableFieldTypeMap = FieldTypeDescriptor.values.reduce((result, cur) => {
    result[cur] = FieldTypeDescriptor.checkValueValid(cur)
    return result
  }, {})

  get fieldTypeOptions() {
    const options = this.fullFieldTypeOptions.filter((option) => {
      const v1 = this.useNormalField ? 1 : -1
      const v2 = checkSpecialField(option.value as FieldType) ? 1 : -1
      return v1 * v2 === -1
    })
    options.forEach((option) => {
      option.disabled = !this.availableFieldTypeMap[option.value]
    })
    return options
  }

  continueToCreate = true

  modelKey: string = ''
  forEditing = false
  forBind = false
  copingFieldKey = ''
  data: ModelFieldModel | any = {
    constraintKey: '',
    fieldKey: '',
    name: '',
    required: 0,
    useDefault: 0,
    defaultValue: '',
    fieldType: '',
    remarks: '',
    special: 0,
    star: 0,
    options: [],
    dateRange: {
      floor: '',
      ceil: '',
    },
    searchable: 0,
    useEnumSelector: false,
    isHidden: 0,
    isSystem: 0,
    keyAlias: 0,
    referenceKey: '',
    referenceCheckedInfos: [],
    nameI18n: {
      [I18nCode.en]: '',
      [I18nCode.zhHans]: '',
    },
    extrasData: {
      readonly: false,
      matchRegex: '',
    } as ModelFieldExtrasData,
  }

  constructor() {
    super()
  }

  @Watch('data.fieldType', { immediate: true })
  onFieldTypeChanged(value: string) {
    this.useNormalField = !checkSpecialField(value as FieldType)
  }

  get canBeSearchable() {
    return this.isSingleLineType && !this.forBind
  }

  get isDateType() {
    return this.data.fieldType === FieldType.Date || this.data.fieldType === FieldType.Datetime
  }

  get isSingleLineType() {
    return this.data.fieldType === FieldType.SingleLineText
  }

  get isEnumType() {
    return this.data.fieldType === FieldType.Enum || this.data.fieldType === FieldType.TextEnum
  }

  get isTagsType() {
    return this.data.fieldType === FieldType.Tags || this.data.fieldType === FieldType.MultiEnum
  }

  static bindFieldDialog(availableFieldTypes: FieldType[]) {
    const dialog = new ModelFieldDialog()
    dialog.title = '绑定字段'
    dialog.forBind = true
    dialog.data.required = 0
    dialog.availableFieldTypeMap = availableFieldTypes.reduce((result, cur) => {
      result[cur] = true
      return result
    }, {})
    return dialog
  }

  static createFieldDialog(data?: ModelFieldModel) {
    const dialog = new ModelFieldDialog()
    dialog.title = '创建字段'
    if (data) {
      dialog.copingFieldKey = data.fieldKey
      const newData: ModelFieldModel = JSON.parse(JSON.stringify(data))
      newData.fieldKey = ''
      dialog.data = newData
    }
    return dialog
  }

  static editFieldDialog(data: ModelFieldModel) {
    const dialog = new ModelFieldDialog()
    dialog.title = '编辑字段'
    dialog.forEditing = true
    dialog.data = JSON.parse(JSON.stringify(data))
    dialog.data.options.forEach((option: any) => {
      option.already = true
    })
    return dialog
  }

  async onSubmit() {
    if (this.callback) {
      this.data.options.forEach((option: any) => {
        if (this.data.fieldType !== FieldType.TextEnum && this.data.fieldType !== FieldType.MultiEnum) {
          option.value = Number(option.value)
        } else {
          option.value = `${option.value}`.trim()
        }
        option.label = option.label.trim()
      })
      await this.callback(this.data)
    }
    this.dismiss()
  }
}

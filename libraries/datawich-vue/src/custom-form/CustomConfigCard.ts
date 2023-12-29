import { Component } from 'vue-property-decorator'
import { i18n, Prop, ViewController } from '@fangcha/vue'
import {
  FieldType,
  GeneralDataFormatter,
  ModelFieldModel,
  ModelFullMetadata,
  SdkDatawichApis2,
} from '@fangcha/datawich-service'
import { MyAxios } from '@fangcha/vue/basic'
import { OssFileInfo } from '@fangcha/oss-models'
import { I18nCode } from '@fangcha/tools'
import { MultiEnumContainer } from './MultiEnumContainer'

@Component({
  components: {
    'multi-enum-container': MultiEnumContainer,
  },
  template: `
    <ul class="my-0 pl-3">
      <li v-for="field of modelFields" :key="field.dataKey">
        <b>{{ getFieldName(field) }}</b>:
        <multi-enum-container
          v-else-if="field.fieldType === FieldType.MultiEnum" 
          :options="field.options"
          :value="configData[field.dataKey]"
        />
        <template v-else-if="field.fieldType === FieldType.Attachment">
          <a v-if="fieldOssFileInfoMap[field.dataKey] && fieldOssFileInfoMap[field.dataKey].url" :href="fieldOssFileInfoMap[field.dataKey].url" target="_blank">点击查看</a>
        </template>
        <b v-else-if="field.fieldType === FieldType.TextEnum" class="text-danger">
          {{ field.value2LabelMap[configData[field.dataKey]] }}
        </b>
        <b v-else class="text-danger">{{ configData[field.dataKey] }}</b>
      </li>
    </ul>
  `,
})
export class CustomConfigCard extends ViewController {
  FieldType = FieldType

  @Prop({ default: null, type: Object }) readonly metadata!: ModelFullMetadata
  @Prop({ default: null, type: Object }) readonly configData!: any

  constructor() {
    super()
  }

  getFieldName(field: ModelFieldModel) {
    const nameI18n = field.nameI18n || {}
    if (i18n.locale === 'en') {
      return nameI18n[I18nCode.en] || field.name
    }
    return nameI18n[I18nCode.zhHans] || field.name
  }

  fieldOssFileInfoMap: { [p: string]: OssFileInfo } = {}

  get modelFields() {
    return this.metadata.modelFields
      .filter((item) => !item.isHidden)
      .map((item) => GeneralDataFormatter.formatModelField(item))
  }

  async viewDidLoad() {
    const attachmentFields = this.modelFields.filter((item) => item.fieldType === FieldType.Attachment)
    const fieldOssFileInfoMap: { [p: string]: OssFileInfo } = {}
    attachmentFields
      .filter((field) => this.configData[field.dataKey])
      .map((field) => {
        const data: OssFileInfo = JSON.parse(this.configData[field.dataKey])
        return data
      })
    for (const field of attachmentFields) {
      if (!this.configData[field.dataKey]) {
        continue
      }
      try {
        fieldOssFileInfoMap[field.dataKey] = JSON.parse(this.configData[field.dataKey])
      } catch (e) {}
    }
    if (Object.keys(fieldOssFileInfoMap).length > 0) {
      const request = MyAxios(SdkDatawichApis2.OssUrlsSignature)
      request.setBodyData({
        ossKeys: Object.values(fieldOssFileInfoMap).map((ossInfo) => {
          return ossInfo.ossKey
        }),
      })
      const attachmentUrlMap: { [p: string]: string } = await request.quickSend()
      Object.values(fieldOssFileInfoMap).forEach((ossInfo) => {
        ossInfo.url = attachmentUrlMap[ossInfo.ossKey]
      })
      this.fieldOssFileInfoMap = fieldOssFileInfoMap
    }
  }
}

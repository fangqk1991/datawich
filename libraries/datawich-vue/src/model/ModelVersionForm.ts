import { Component, Model } from 'vue-property-decorator'
import { Prop, ViewController, Watch } from '@fangcha/vue'
import {
  CustomConfigParams,
  ModelFullMetadata,
  ModelMilestoneModel,
  TinyModelInfo,
} from '@fangcha/datawich-service'
import { CommonAPI } from '@fangcha/app-request'
import { DatawichFrontendService } from '../DatawichFrontendService'
import { ModelStructurePanel } from './ModelStructurePanel'
import { ModelMetadataCenter } from '../utils'

@Component({
  components: {
    'model-structure-panel': ModelStructurePanel,
  },
  template: `
    <div>
      <el-form size="small" label-width="120px">
        <el-form-item label="目标模型" :required="true" class="my-form-item">
          <el-select v-model="tagData.modelKey" style="width: 100%;" @change="reloadCurrentModelVersions">
            <el-option v-for="model in availableModels" :key="model.modelKey" :label="model | describe_tiny_model_summary" :value="model.modelKey" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="tagData.modelKey" label="模型版本" :required="true" class="my-form-item">
          <el-select v-model="tagData.metadataVersion" style="width: 100%;" @change="reloadCurrentModelVersionMetadata">
            <el-option v-for="version in curModelVersions" :key="version.tagName" :label="versionLabel(version)" :value="version.tagName" />
          </el-select>
          <div v-if="curModel">
            <small>
              可前往 <a :href="curModelPage()" target="_blank">数据模型·{{ curModel.name }}</a> 创建更多版本
              |
              <a href="javascript:" @click="reloadCurrentModelVersions">点击刷新</a>
            </small>
          </div>
        </el-form-item>
      </el-form>
      <model-structure-panel v-if="curModelVersionMetadata" class="my-2 bordered-content" :metadata="curModelVersionMetadata" />
    </div>
  `,
})
export class ModelVersionForm extends ViewController {
  @Prop({
    default: () => {
      return []
    },
    type: Array,
  })
  readonly availableModels!: TinyModelInfo[]

  tagData: CustomConfigParams = {
    modelKey: '',
    metadataVersion: '',
  }

  @Model('update:value', { type: Object, default: null }) readonly value!: CustomConfigParams | null
  @Watch('value', { immediate: true, deep: true })
  onValueChanged(val: CustomConfigParams | null) {
    if (val) {
      this.tagData = val
    }
  }

  async viewDidLoad() {
    this.onValueChanged(this.value)
    await this.reloadCurrentModelVersions()
  }

  curModelPage() {
    return CommonAPI.buildUrl(DatawichFrontendService.systemInfo.modelStructureBaseURL, this.tagData.modelKey)
  }

  versionLabel(version: ModelMilestoneModel) {
    if (!version.description) {
      return version.tagName
    }
    return `${version.tagName} - ${version.description}`
  }

  curModel: TinyModelInfo | null = null
  curModelVersions: ModelMilestoneModel[] = []
  curModelVersionMetadata: ModelFullMetadata | null = null

  async reloadCurrentModelVersions() {
    if (!this.tagData.modelKey) {
      this.curModel = null
      this.curModelVersions = []
      this.tagData.metadataVersion = ''
      this.curModelVersionMetadata = null
      // this.$emit('on-metadata-change', this.curModelVersionMetadata)
      return
    }
    this.curModel = this.availableModels.find((item) => item.modelKey === this.tagData.modelKey)!
    this.curModelVersions = await ModelMetadataCenter.prepareModelVersions(this.tagData.modelKey)
    if (this.curModelVersions.length > 0) {
      if (!this.curModelVersions.find((item) => item.tagName === this.tagData.metadataVersion)) {
        this.tagData.metadataVersion = this.curModelVersions[0].tagName
      }
    } else {
      this.tagData.metadataVersion = ''
    }
    this.reloadCurrentModelVersionMetadata()
  }

  async reloadCurrentModelVersionMetadata() {
    if (!this.tagData.modelKey || !this.tagData.metadataVersion) {
      this.curModelVersionMetadata = null
    } else {
      this.curModelVersionMetadata = await ModelMetadataCenter.prepareVersionMetadata(
        this.tagData.modelKey,
        this.tagData.metadataVersion
      )
    }
    {
      const value = this.tagData.modelKey && this.tagData.metadataVersion ? this.tagData : null
      this.$emit('update:value', value)
      this.$emit('change', value, this.curModelVersionMetadata)
    }
  }
}

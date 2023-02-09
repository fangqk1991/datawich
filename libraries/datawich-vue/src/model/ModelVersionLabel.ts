import { Component, Model } from 'vue-property-decorator'
import { ViewController, Watch } from '@fangcha/vue'
import { ModelVersionSpan } from './ModelVersionSpan'
import { CustomConfigParams } from '@fangcha/datawich-service'
import { ModelVersionDialog } from './ModelVersionDialog'
import { DatawichFrontendService } from '../DatawichFrontendService'

@Component({
  components: {
    'model-version-span': ModelVersionSpan,
  },
  template: `
    <span>
      <model-version-span v-if="isValid" :tag-data="tagData" />
      <template>
        | <a href="javascript:" @click="onPickVersion">选择版本</a>
      </template>
    </span>
  `,
})
export class ModelVersionLabel extends ViewController {
  tagData: CustomConfigParams = {
    modelKey: '',
    metadataVersion: '',
  }

  @Model('update:value', { type: Object, default: null }) readonly value!: CustomConfigParams | null
  @Watch('value', { immediate: true, deep: true })
  onValueChanged(val: CustomConfigParams | null) {
    if (val) {
      this.tagData = val
    } else {
      this.tagData = {
        modelKey: '',
        metadataVersion: '',
      }
    }
  }

  async viewDidLoad() {
    this.onValueChanged(this.value)
  }

  get isValid() {
    return !!this.tagData && !!this.tagData.modelKey && !!this.tagData.metadataVersion
  }

  async onPickVersion() {
    const modelList = await this.execHandler(async () => {
      const handler =
        DatawichFrontendService.params.default_loadAvailableCustomModels ||
        (async () => {
          return []
        })
      return handler()
    })
    const dialog = ModelVersionDialog.dialog(modelList)
    if (this.tagData) {
      dialog.configData = this.tagData
    }
    dialog.show((tagData: CustomConfigParams) => {
      this.tagData = tagData
      this.$emit('update:value', tagData)
      this.$emit('change', tagData)
    })
  }
}

import { Component, Prop } from 'vue-property-decorator'
import { ViewController } from '@fangcha/vue'
import { CustomConfigParams } from '@fangcha/datawich-service'
import { NotificationCenter } from 'notification-center-js'

@Component({
  template: `
    <a v-if="tagData" :href="tagData.modelKey | build_model_page_url" target="_blank">
      {{ tagData.modelKey }} {{ tagData.metadataVersion }}
    </a>
  `,
})
export class ModelVersionSpan extends ViewController {
  @Prop({ default: null, type: Object }) readonly tagData!: CustomConfigParams

  viewDidLoad() {
    NotificationCenter.defaultCenter().addObserver('__onDatawichSystemInfoChanged', () => {
      this.$forceUpdate()
    })
  }
}

import { Component } from 'vue-property-decorator'
import { Prop, ViewController } from '@fangcha/vue'
import { ModelFullMetadata, ModelMilestoneModel } from '@fangcha/datawich-service'
import { DataNormalForm } from '../data-app'
import { GeneralDataFormatter } from '@fangcha/datawich-service'

@Component({
  components: {
    'data-normal-form': DataNormalForm,
  },
  template: `
    <div>
      <h5>表单 <a v-if="!hideActions" style="font-size: 70%" href="javascript:" @click="loadDefaultValues">载入默认值</a></h5>
      <data-normal-form
        ref="my-form"
        :model-key="metadata.modelKey"
        :my-data="myData"
        :all-fields="writeableFields"
        :readonly="readonly"
        :force-editing="forceEditing"
      />
    </div>
  `,
})
export class CustomDataForm extends ViewController {
  @Prop({ default: null, type: Object }) readonly metadata!: ModelFullMetadata
  @Prop({
    default: () => {
      return {}
    },
    type: Object,
  })
  readonly myData!: any
  @Prop({ default: false, type: Boolean }) readonly readonly!: boolean
  @Prop({ default: false, type: Boolean }) readonly hideActions!: boolean
  @Prop({ default: false, type: Boolean }) readonly forceEditing!: boolean

  versionLabel(version: ModelMilestoneModel) {
    if (!version.description) {
      return version.tagName
    }
    return `${version.tagName} - ${version.description}`
  }

  get writeableFields() {
    const fields = this.metadata.modelFields
      .filter((field) => !field.isSystem)
      .filter((field) => this.forceEditing || !field.isHidden)
    return fields.map((item) => {
      return GeneralDataFormatter.formatModelField(item)
    })
  }

  loadDefaultValues() {
    const fields = this.writeableFields.filter((item) => item.useDefault)
    for (const field of fields) {
      this.myData[field.dataKey] = field.defaultValue
    }
  }

  exportResult() {
    const myForm = this.$refs['my-form'] as DataNormalForm
    return myForm.exportResult()
  }
}

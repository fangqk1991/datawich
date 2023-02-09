import { Component } from 'vue-property-decorator'
import { Prop, ViewController } from '@fangcha/vue'
import { ModelFullMetadata } from '@fangcha/datawich-service'
import { GeneralDataFormatter } from '@fangcha/datawich-service'

@Component({
  template: `
    <div style="font-size: 14px;">
      <h5>{{ metadata.modelKey }} {{ metadata.tagName }} 配置</h5>
      <ul class="my-0 pl-3">
        <li v-for="field of writeableFields" :key="field.dataKey">
          <b>{{ field.name }} ({{ field.dataKey }})</b> :
          {{ field.fieldType | describe_model_field_type }}
        </li>
      </ul>
    </div>
  `,
})
export class ModelStructurePanel extends ViewController {
  @Prop({ default: null, type: Object }) readonly metadata!: ModelFullMetadata

  get writeableFields() {
    return this.metadata.modelFields
      .filter((field) => !field.isSystem)
      .map((item) => {
        return GeneralDataFormatter.formatModelField(item)
      })
  }
}

import { Component } from 'vue-property-decorator'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { Prop, ViewController } from '@fangcha/vue'

@Component
export class FieldFormItemBase extends ViewController {
  @Prop({ default: null, type: Object }) readonly field!: ModelFieldModel
  @Prop({
    default: () => {
      return {}
    },
    type: Object,
  })
  readonly myData!: any
  @Prop({ default: false, type: Boolean }) readonly readonly!: boolean
  @Prop({ default: false, type: Boolean }) readonly forceEditing!: boolean

  get checkFieldEditable() {
    if (this.readonly) {
      return false
    }
    if (this.forceEditing) {
      return true
    }
    return !this.field.extrasData.readonly
  }
}

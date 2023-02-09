import { Component, Prop, ViewController } from '@fangcha/vue'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { FieldFormItemBase } from './FieldFormItemBase'

@Component({})
export class PluginFormItem extends ViewController {
  @Prop({ default: null, type: Function }) readonly formItemView!: typeof FieldFormItemBase

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

  viewDidLoad() {}

  render(createElement: any) {
    return createElement('div', [
      createElement(this.formItemView, {
        props: {
          field: this.field,
          myData: this.myData,
          readonly: this.readonly,
          forceEditing: this.forceEditing,
        },
      }),
    ])
  }
}

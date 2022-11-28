import { ViewController, Component, Prop } from '@fangcha/vue'
import { ModelFieldModel } from '@fangcha/datawich-service/lib/common/models'

@Component
export default class EnumFieldExtensionBase extends ViewController {
  @Prop({ default: '', type: String }) readonly modelKey!: string
  @Prop({ default: null, type: Object }) readonly data!: ModelFieldModel
  @Prop({ default: false, type: Boolean }) readonly forEditing!: boolean

  @Prop({ default: false, type: Boolean }) readonly readonly!: boolean

  removeEnumOption(index: number) {
    this.data.options.splice(index, 1)
  }

  addEnumOption(index: number = -1) {
    const nextItem = {
      label: '',
      value: '',
      restraintValueMap: {},
    }
    if (index >= 0) {
      this.data.options.splice(index + 1, 0, nextItem)
    } else {
      this.data.options.push(nextItem)
    }
  }
}

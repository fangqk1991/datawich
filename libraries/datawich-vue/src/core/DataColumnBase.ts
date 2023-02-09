import { Component, Prop, ViewController } from '@fangcha/vue'
import { GeneralDataHelper, ModelFieldModel } from '@fangcha/datawich-service'

@Component
export class DataColumnBase extends ViewController {
  @Prop({ default: undefined, type: Object }) readonly superField!: ModelFieldModel | undefined
  @Prop({ default: null, type: Object }) readonly field!: ModelFieldModel
  @Prop({
    default: () => {
      return {}
    },
    type: Object,
  })
  readonly filterOptions!: {}

  onFilterUpdate() {
    this.$emit('on-filter-change', this.filterOptions)
  }

  get dataKey() {
    return GeneralDataHelper.calculateDataKey(this.field, this.superField)
  }
}

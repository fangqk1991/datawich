import { Component, Prop, ViewController } from '@fangcha/vue'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { DataColumnBase } from './DataColumnBase'

@Component({})
export class PluginDataColumn extends ViewController {
  @Prop({ default: null, type: Function }) readonly columnView!: typeof DataColumnBase

  @Prop({ default: undefined, type: Object }) readonly superField!: ModelFieldModel | undefined
  @Prop({ default: null, type: Object }) readonly field!: ModelFieldModel

  @Prop({
    default: () => {
      return {}
    },
    type: Object,
  })
  readonly filterOptions!: {}

  viewDidLoad() {}

  render(createElement: any) {
    return createElement('div', [
      createElement(this.columnView, {
        props: {
          superField: this.superField,
          field: this.field,
          filterOptions: this.filterOptions,
        },
        on: {
          'on-filter-change': () => {
            this.$emit('on-filter-change', this.filterOptions)
          },
        },
      }),
    ])
  }
}

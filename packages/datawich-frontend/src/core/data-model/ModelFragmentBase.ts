import { DataModelModel } from '@fangcha/datawich-service/lib/common/models'
import { Component, Prop, ViewController, Watch } from '@fangcha/vue'

@Component
export class ModelFragmentBase extends ViewController {
  @Prop({ default: null, type: Object }) readonly dataModel!: DataModelModel

  @Watch('dataModel')
  onDataModelChanged() {
    this.onLoadWidgetsInfo()
  }

  async onLoadWidgetsInfo() {}

  get modelKey() {
    return this.dataModel.modelKey
  }

  viewDidLoad() {}
}

import { ModelFieldModel } from '@fangcha/datawich-service'
import Vue from 'vue'
import { FieldPluginProtocol } from './FieldPluginProtocol'

class _FieldPluginCenter {
  private _pluginMapper: { [fieldType: string]: FieldPluginProtocol } = {}

  public addPlugin(...plugins: FieldPluginProtocol[]) {
    for (const plugin of plugins) {
      this._pluginMapper[plugin.fieldType] = plugin
    }
  }

  public getFieldPlugin(field: ModelFieldModel): FieldPluginProtocol | undefined {
    return this._pluginMapper[field.fieldType]
  }

  public onFormDataChanged(vue: Vue, data: any, fields: ModelFieldModel[]) {
    fields.forEach((field) => {
      const plugin = this.getFieldPlugin(field)
      if (plugin && plugin.onFormDataChanged) {
        plugin.onFormDataChanged(vue, data, field)
      }
    })
  }
}

export const FieldPluginCenter = new _FieldPluginCenter()

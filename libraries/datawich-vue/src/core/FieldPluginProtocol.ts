import { FieldType, ModelFieldModel } from '@fangcha/datawich-service'
import Vue from 'vue'
import { DataColumnBase } from './DataColumnBase'
import { FieldFormItemBase } from './FieldFormItemBase'

export interface FieldPluginProtocol {
  fieldType: FieldType
  columnView: typeof DataColumnBase
  formItemView: typeof FieldFormItemBase
  onFormDataChanged?: (vue: Vue, data: any, field: ModelFieldModel) => void
}

import { TextSymbol } from '@fangcha/logic'
import { ModelFieldModel } from '../field/ModelFieldModel'

export interface FieldsDisplaySettings {
  hiddenFieldsMap: { [p: string]: boolean }
  checkedList: string[]
  fixedList: string[]
}

export interface FieldFilterParams {
  key: string
  filterKey: string
  symbol: TextSymbol
  value: string | string[]
}

export interface FieldFilterItem extends FieldFilterParams {
  key: string
  filterKey: string
  symbol: TextSymbol
  field: ModelFieldModel
  value: string | string[]
}

export interface ModelPanelConfig {
  filterItems: FieldFilterParams[]
  displaySettings: FieldsDisplaySettings
}

export interface ModelPanelInfo {
  panelId: string
  modelKey: string
  author: string
  name: string
  configData: ModelPanelConfig
  createTime: string
  updateTime: string
}

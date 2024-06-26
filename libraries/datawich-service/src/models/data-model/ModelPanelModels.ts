import { TextSymbol } from '@fangcha/logic'
import { ModelFieldModel } from '../field/ModelFieldModel'

export interface FieldsDisplaySettings {
  hiddenFieldsMap: { [p: string]: boolean }
  checkedList: string[]
  fixedList: string[]
}

export interface FieldFilterParams {
  isNot?: boolean
  disabled?: boolean
  key: string
  filterKey: string
  symbol: TextSymbol
  value: string | string[]
}

export interface FieldFilterItem extends FieldFilterParams {
  isNot?: boolean
  disabled?: boolean
  key: string
  filterKey: string
  symbol: TextSymbol
  field: ModelFieldModel
  value: string | string[]
}

export interface ModelPanelConfig {
  displaySettings: FieldsDisplaySettings
  queryParams: { [p: string]: any }
}

export interface ModelPanelParams {
  name: string
  configData: ModelPanelConfig
  isPublic?: number
  author?: string
}

export interface ModelPanelInfo {
  panelId: string
  modelKey: string
  author: string
  name: string
  isPublic: number
  configData: ModelPanelConfig
  createTime: string
  updateTime: string
}

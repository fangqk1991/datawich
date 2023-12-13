import { FieldFilterParams } from './FieldFilterItem'

export interface ModelPanelConfig {
  filterItems: FieldFilterParams[]
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

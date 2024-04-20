import { DataModelModel } from './DataModelModel'
import { ModelFieldModel } from '../field/ModelFieldModel'
import { ModelPanelInfo } from './ModelPanelModels'

export interface FullDataInfo {
  dataModel: DataModelModel
  mainFields: ModelFieldModel[]
  panelInfo: ModelPanelInfo | null
  data: any
}

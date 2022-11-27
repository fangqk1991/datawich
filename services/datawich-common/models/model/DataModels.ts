import { Raw_DataModel } from '../auto-build'
import { DataRecordEvent } from '../DataRecordEvent'

export interface DataModelExtrasData {
  hideCreateButton: boolean
  keyAlias: string
  dataInfoTmpl?: string
  broadcastEventData?: { [p in DataRecordEvent]: boolean }
}

export interface SessionModelPowerData {
  [p: string]: boolean
}

export interface DataModelModel extends Raw_DataModel {
  keyAlias: string
  // session 对当前模型的访问能力
  powerData: SessionModelPowerData
  extrasData: DataModelExtrasData
  // 特殊标记，如 GoodsPower
  tagList: string[]
}

export interface DataModelExtrasData {
  hideCreateButton: boolean
  dataInfoTmpl?: string
  broadcastEventData?: { [p in string]: boolean }
  defaultPanelId?: string
  needLogin?: boolean
}

export interface SessionModelPowerData {
  [p: string]: boolean
}

export interface DataModelParams {
  modelKey: string
  shortKey: string | null
  modelType: string
  accessLevel: string
  name: string
  description: string
  remarks: string
  isOnline: number
  isLibrary: number
}

export interface DataModelModel extends DataModelParams {
  modelKey: string
  modelType: string
  shortKey: string | null
  name: string
  description: string
  remarks: string
  version: number
  accessLevel: string
  isRetained: number
  isDataInsertable: number
  isDataModifiable: number
  isDataDeletable: number
  isOnline: number
  isCustom: number
  isLibrary: number
  isLocked: number
  isDeleted: number
  author: string
  sampleDate: string
  tags: string
  extrasInfo: string
  createTime: string
  updateTime: string

  ////////////////////////////
  // session 对当前模型的访问能力
  powerData: SessionModelPowerData
  extrasData: DataModelExtrasData
  // 特殊标记，如 GoodsPower
  tagList: string[]
}

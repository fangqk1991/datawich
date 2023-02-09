export interface DataModelExtrasData {
  hideCreateButton: boolean
  keyAlias: string
  dataInfoTmpl?: string
  broadcastEventData?: { [p in string]: boolean }
}

export interface SessionModelPowerData {
  [p: string]: boolean
}

export interface DataModelModel {
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
  isDataExportable: number
  isOnline: number
  isCustom: number
  isLibrary: number
  isLocked: number
  useEmail: number
  isBroadcast: number
  isDeleted: number
  star: number
  wechatbotKey: string
  author: string
  defaultMemberLevel: number
  sampleDate: string
  tags: string
  extrasInfo: string
  createTime: string
  updateTime: string

  ////////////////////////////
  keyAlias: string
  // session 对当前模型的访问能力
  powerData: SessionModelPowerData
  extrasData: DataModelExtrasData
  // 特殊标记，如 GoodsPower
  tagList: string[]
}

export interface Raw_DataModel {
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
}

export const Keys_Raw_DataModel = [
  // prettier-ignore
  'modelKey',
  'modelType',
  'shortKey',
  'name',
  'description',
  'remarks',
  'version',
  'accessLevel',
  'isRetained',
  'isDataInsertable',
  'isDataModifiable',
  'isDataDeletable',
  'isDataExportable',
  'isOnline',
  'isCustom',
  'isLibrary',
  'isLocked',
  'useEmail',
  'isBroadcast',
  'isDeleted',
  'star',
  'wechatbotKey',
  'author',
  'defaultMemberLevel',
  'sampleDate',
  'tags',
  'extrasInfo',
  'createTime',
  'updateTime',
]

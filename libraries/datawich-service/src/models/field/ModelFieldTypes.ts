export interface FieldActionParams {
  actionId: string
  event: string
  title: string
  content: string
}

export interface FieldIndexModel {
  modelKey: string
  fieldKey: string
  isUnique: number
  createTime: string
  updateTime: string
}

export interface Raw_FieldLink {
  linkId: string
  modelKey: string
  fieldKey: string
  refModel: string
  refField: string
  isForeignKey: number
  isInline: number
  fkName: string
  onUpdateAction: string
  onDeleteAction: string
  extrasInfo: string
  createTime: string
  updateTime: string
}

export const Keys_Raw_FieldLink = [
  // prettier-ignore
  'linkId',
  'modelKey',
  'fieldKey',
  'refModel',
  'refField',
  'isForeignKey',
  'isInline',
  'fkName',
  'onUpdateAction',
  'onDeleteAction',
  'extrasInfo',
  'createTime',
  'updateTime',
]

export interface Raw_ModelField {
  modelKey: string
  fieldKey: string
  name: string
  required: number
  useDefault: number
  defaultValue: string
  fieldType: string
  extrasInfo: string
  remarks: string
  special: number
  weight: number
  isSystem: number
  isHidden: number
  isDeleted: number
  createTime: string
  updateTime: string
}

export const Keys_Raw_ModelField = [
  // prettier-ignore
  'modelKey',
  'fieldKey',
  'name',
  'required',
  'useDefault',
  'defaultValue',
  'fieldType',
  'extrasInfo',
  'remarks',
  'special',
  'weight',
  'isSystem',
  'isHidden',
  'isDeleted',
  'createTime',
  'updateTime',
]

export interface FieldActionModel {
  actionId: string
  modelKey: string
  fieldKey: string
  event: string
  title: string
  content: string
  createTime: string
  updateTime: string
}

export interface FieldGroupModel {
  modelKey: string
  groupKey: string
  name: string
  displayMode: string
  displayTmpl: string
  createTime: string
  updateTime: string
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
  groupKey: string
  name: string
  inputHint: string
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
  forBroadcast: number
  star: number
  createTime: string
  updateTime: string
}

export const Keys_Raw_ModelField = [
  // prettier-ignore
  'modelKey',
  'fieldKey',
  'groupKey',
  'name',
  'inputHint',
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
  'forBroadcast',
  'star',
  'createTime',
  'updateTime',
]

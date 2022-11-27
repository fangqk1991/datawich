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

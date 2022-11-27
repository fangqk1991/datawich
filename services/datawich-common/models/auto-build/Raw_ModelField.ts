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

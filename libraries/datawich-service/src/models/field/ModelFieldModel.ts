import { I18nTextData, SelectOption } from '@fangcha/tools'
import { FieldLinkModel } from './FieldLinkModel'
import { FieldType } from './FieldType'
import { FieldActionParams, Raw_ModelField } from './ModelFieldTypes'
import { LogicExpression } from '@fangcha/logic'
import { NumberFormat } from './NumberFormat'

export interface DateRange {
  floor: string
  ceil: string
}

export interface ActionInfo {
  event: string
  content: string
}

export interface ReferenceCheckedInfo {
  fieldKey: string
  mappingName: string
  checked: boolean
}

export interface ModelFieldExtrasData {
  keyAlias: string
  dateRange: DateRange
  searchable: boolean
  useEnumSelector: boolean
  referenceCheckedInfos: ReferenceCheckedInfo[]
  referenceInline: number
  constraintKey: string
  actions: FieldActionParams[]
  nameI18n: I18nTextData
  readonly: boolean
  matchRegex: string
  numberFormat?: NumberFormat
  floatBits?: number
  visibleLogic?: LogicExpression
  requiredLogic?: LogicExpression
  bigText?: boolean
  useRawTextEditor?: boolean
}

export interface ModelFieldParams {
  fieldKey: string
  name: string
  required: number
  fieldType: FieldType
  options?: SelectOption[]
  extrasData?: Partial<ModelFieldExtrasData>
}

export interface ModelFieldModel extends Raw_ModelField {
  fieldType: FieldType
  ////
  options: { value: number | string; label: string }[]
  value2LabelMap: { [p: string]: string }
  isUnique: number
  extrasData: ModelFieldExtrasData
  referenceInline: number
  referenceCheckedInfos: ReferenceCheckedInfo[]
  constraintKey: string
  filterKey: string
  dataKey: string
  refFieldLinks: FieldLinkModel[]
  fieldDisplayMode: string
  fieldDisplayTmpl: string
  groupFields: ModelFieldModel[]
}

export interface DescribableField {
  fieldKey: string
  fieldType: FieldType
  name: string
  dataKey: string
  keyAlias?: string
  options?: SelectOption[]
  value2LabelMap?: { [p: string]: any }
}

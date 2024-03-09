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

export interface ModelFieldExtrasData {
  keyAlias: string
  dateRange: DateRange
  searchable: boolean
  useEnumSelector: boolean
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
  fieldKey: string
  fieldType: FieldType
  name: string
  required: number
  hidden?: boolean

  ////
  options: SelectOption[]
  value2LabelMap: { [p: string]: string }
  isUnique: number
  extrasData: ModelFieldExtrasData
  filterKey: string
  dataKey: string
  refFieldLinks: FieldLinkModel[]
  defaultValue: string
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

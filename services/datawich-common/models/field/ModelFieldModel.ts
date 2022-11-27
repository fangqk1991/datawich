import { FieldDisplayMode } from '../FieldDisplayMode'
import { Raw_ModelField } from '../auto-build'
import { I18nTextData, SelectOption } from '@fangcha/tools'
import { FieldLinkModel } from './FieldLinkModel'
import { FieldType } from './FieldType'
import { LogicExpression } from '../calc'

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
  searchable: number
  useEnumSelector: boolean
  referenceCheckedInfos: ReferenceCheckedInfo[]
  referenceInline: number
  constraintKey: string
  actions: ActionInfo[]
  nameI18n: I18nTextData
  readonly: boolean
  matchRegex: string
  visibleLogic?: LogicExpression
  requiredLogic?: LogicExpression
}

export interface ModelFieldModel extends Raw_ModelField {
  fieldType: FieldType
  ////
  options: { value: number | string; label: string }[]
  value2LabelMap: { [p: string]: string }
  dateRange: DateRange
  searchable: number
  isUnique: number
  extrasData: ModelFieldExtrasData
  referenceInline: number
  referenceCheckedInfos: ReferenceCheckedInfo[]
  constraintKey: string
  filterKey: string
  dataKey: string
  actions: ActionInfo[]
  refFieldLinks: FieldLinkModel[]
  fieldDisplayMode: FieldDisplayMode
  fieldDisplayTmpl: string
  groupName: string
  groupFields: ModelFieldModel[]
  useEnumSelector: boolean
  keyAlias: string
  nameI18n: I18nTextData
}

export interface ForAnalysisParams {
  modelKey: string
  checked: boolean
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

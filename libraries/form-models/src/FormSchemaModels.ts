import { SelectOption } from '@fangcha/tools'
import { FormFieldType } from './FormFieldType'
import { LogicExpression } from '@fangcha/logic'
import { FieldNumberType } from './FieldNumberType'
import { FieldEnumType } from './FieldEnumType'
import { FieldObjectType } from './FieldObjectType'
import { FieldStringType } from './FieldStringType'
import { NumberFormat } from './NumberFormat'

export interface FormFieldExtrasData {
  enumType: FieldEnumType
  options: SelectOption[]
  value2LabelMap: { [p: string]: string }

  numberType: FieldNumberType
  numberFormat: NumberFormat
  floatBits: number
  bigText: boolean

  objectType: FieldObjectType

  stringType: FieldStringType
  multipleLines: boolean

  constraintKey: string

  visibleLogic: LogicExpression
  requiredLogic: LogicExpression
  matchRegex: string

  remarks: string
  isPrimary: boolean
  isUUID: boolean
  isAuthor: boolean
}

export interface FormField {
  fieldKey: string
  fieldType: FormFieldType
  name: string
  filterKey?: string
  dataKey?: string
  isRequired?: boolean
  notVisible?: boolean
  notInsertable?: boolean
  notModifiable?: boolean
  defaultValue?: string | number | null
  readonly?: boolean
  fullKeys?: string[]
  subFields?: FormField[]
  $isForm?: boolean
  extras: Partial<FormFieldExtrasData>
}

export interface FormFieldParams extends Partial<FormField> {
  fieldType: FormFieldType
}

export type SchemaFormFieldsMap<T extends {} = {}> = {
  [p in keyof T]: FormFieldType | FormFieldParams | SchemaFormFieldsMap
}

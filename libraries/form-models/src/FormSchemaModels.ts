import { SelectOption } from '@fangcha/tools'
import { FormFieldType } from './FormFieldType'
import { LogicExpression } from '@fangcha/logic'
import { FieldNumberType } from './FieldNumberType'
import { FieldEnumType } from './FieldEnumType'
import { FieldObjectType } from './FieldObjectType'
import { FieldStringType } from './FieldStringType'

export interface FormFieldExtrasData {
  enumType: FieldEnumType
  options: SelectOption[]
  value2LabelMap: { [p: string]: string }

  numberType: FieldNumberType
  objectType: FieldObjectType

  stringType: FieldStringType
  multipleLines: boolean

  defaultValue: string

  isRequired: boolean

  readonly: boolean

  notInsertable: boolean
  notModifiable: boolean

  notVisible: boolean

  constraintKey: string

  visibleLogic: LogicExpression
  requiredLogic: LogicExpression
  matchRegex: string
}

export interface FormField {
  fieldKey: string
  fieldType: FormFieldType
  name: string
  extrasData: Partial<FormFieldExtrasData>
}

export interface FormFieldParams extends Partial<FormField> {
  fieldType: FormFieldType
}

export interface FormSchema {
  name?: string
  fields: FormField[]
}

export type SchemaFormFieldsMap<T extends {} = {}> = { [p in keyof T]: FormFieldType | FormFieldParams }

import { SelectOption } from '@fangcha/tools'
import { FormFieldType } from './FormFieldType'
import { LogicExpression } from '@fangcha/logic'

export interface FormFieldExtrasData {
  enumType: '' | 'Single' | 'Multiple'
  options: SelectOption[]
  value2LabelMap: { [p: string]: string }

  numberType: '' | 'Integer' | 'Float'
  objectType: '' | 'JSON' | 'StringList' | 'Attachment'

  stringType: '' | 'Normal' | 'Link' | 'RichText' | 'CodeText'
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

export type SchemaFormFieldsMap = { [key in keyof FormField]: FormFieldType | FormFieldParams }

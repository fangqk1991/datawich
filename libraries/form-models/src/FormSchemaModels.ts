import { SelectOption } from '@fangcha/tools'
import { FormFieldType } from './FormFieldType'

export interface FormFieldExtrasData {
  isEnum: boolean
  options: SelectOption[]

  multipleLines: boolean

  defaultValue: string

  isRequired: boolean

  readonly: boolean

  notInsertable: boolean
  notModifiable: boolean

  notVisible: boolean
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

export class FormSchemaHelper {
  public static makeSchema(fieldsMap: SchemaFormFieldsMap, name: string = ''): FormSchema {
    return {
      name: name,
      fields: Object.keys(fieldsMap).map((fieldKey) => {
        const props: FormField =
          typeof fieldsMap[fieldKey] === 'string'
            ? {
                fieldType: fieldsMap[fieldKey],
              }
            : fieldsMap[fieldKey]
        props.fieldKey = fieldKey
        props.name = props.name || fieldKey
        props.extrasData = props.extrasData || {}
        return props
      }),
    }
  }
}

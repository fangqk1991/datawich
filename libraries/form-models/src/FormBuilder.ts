import { FormField, SchemaFormFieldsMap } from './FormSchemaModels'
import { FormFieldType, FormFieldTypeDescriptor } from './FormFieldType'
import { FieldObjectType } from './FieldObjectType'
import * as moment from 'moment'

export class FormBuilder {
  private static makeFieldName(field: FormField) {
    return (
      field.name ||
      field.fieldKey
        .split(/[.\-_ ]+/g)
        .map((item) => item.split(/(?=[A-Z]+)/).join(' '))
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join(' ')
    )
  }

  public static detectFieldType(value: any) {
    const valType = typeof value
    let fieldType = FormFieldType.String
    if (valType === 'boolean') {
      fieldType = FormFieldType.Boolean
    } else if (valType === 'number') {
      fieldType = FormFieldType.Number
    } else if (valType === 'string') {
      if (value.match(/^\d{4}-\d{2}-\d{2}$/) && moment(value).isValid()) {
        fieldType = FormFieldType.Date
      } else if (value.match(/^\d{4}-\d{2}-\d{2}/) && moment(value).isValid()) {
        fieldType = FormFieldType.Datetime
      }
    }
    return fieldType
  }

  public static transferToFieldsMap(data: {}) {
    const mapper: SchemaFormFieldsMap = {}
    Object.keys(data).forEach((key) => {
      const value = data[key]
      if (Array.isArray(value)) {
        const childValue = value[0]
        const isItemObject = !!childValue && typeof childValue === 'object'
        if (isItemObject) {
          mapper[key] = {
            fieldType: FormFieldType.Array,
            itemSchema: this.transferToFieldsMap(childValue),
            defaultValue: value,
          }
        } else {
          mapper[key] = {
            fieldType: FormFieldType.Array,
            itemField: {
              fieldType: this.detectFieldType(childValue),
            },
            defaultValue: value,
          }
        }
        return
      }
      if (value && typeof value === 'object') {
        mapper[key] = this.transferToFieldsMap(value)
        return
      }
      mapper[key] = {
        fieldType: this.detectFieldType(value),
        defaultValue: value,
      }
    })
    return mapper
  }

  public static buildFields<T extends {} = {}>(
    fieldsMap: SchemaFormFieldsMap<T>,
    parentKeys: string[] = []
  ): FormField[] {
    return Object.keys(fieldsMap)
      .filter(
        (fieldKey) =>
          !!fieldsMap[fieldKey] &&
          ((typeof fieldsMap[fieldKey] === 'string' && FormFieldTypeDescriptor.checkValueValid(fieldsMap[fieldKey])) ||
            typeof fieldsMap[fieldKey] === 'object')
      )
      .map((fieldKey) => {
        const props = (
          typeof fieldsMap[fieldKey] === 'string'
            ? {
                fieldType: fieldsMap[fieldKey],
              }
            : fieldsMap[fieldKey]
        ) as FormField
        const isForm = props.$isForm || !props.fieldType
        const field = (isForm ? { fieldType: FormFieldType.Object } : props) as FormField
        field.fieldKey = fieldKey
        field.name = this.makeFieldName(field)
        field.extras = field.extras || {}
        field.fullKeys = [...parentKeys, field.fieldKey]
        if (field.fieldType === FormFieldType.Array && field.itemSchema && !field.itemField) {
          field.itemField = {
            fieldType: FormFieldType.Object,
            subFields: this.buildFields(field.itemSchema),
          }
        }
        if (isForm) {
          field.fieldType = FormFieldType.Object
          field.extras.objectType = FieldObjectType.Form
          field.subFields = this.buildFields(props as SchemaFormFieldsMap, field.fullKeys)
        }
        return field
      })
  }
}

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

  public static transferToFieldsMap(data: {}) {
    const mapper: SchemaFormFieldsMap = {}
    Object.keys(data).forEach((key) => {
      const value = data[key]
      const valType = typeof value
      if (value && valType === 'object') {
        mapper[key] = this.transferToFieldsMap(value)
        return
      }
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
      mapper[key] = {
        fieldType: fieldType,
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
        if (isForm) {
          field.fieldType = FormFieldType.Object
          field.extras.objectType = FieldObjectType.Form
          field.subFields = this.buildFields(props as SchemaFormFieldsMap, field.fullKeys)
        }
        return field
      })
  }
}

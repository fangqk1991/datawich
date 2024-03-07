import { FormField, SchemaFormFieldsMap } from './FormSchemaModels'
import { FormFieldType, FormFieldTypeDescriptor } from './FormFieldType'
import { FieldObjectType } from './FieldObjectType'

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
        field.extrasData = field.extrasData || {}
        field.fullKeys = [...parentKeys, field.fieldKey]
        if (isForm) {
          field.fieldType = FormFieldType.Object
          field.extrasData.objectType = FieldObjectType.Form
          field.subFields = this.buildFields(props, field.fullKeys)
        }
        return field
      })
  }
}

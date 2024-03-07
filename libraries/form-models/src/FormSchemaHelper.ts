import { FormField } from './FormSchemaModels'
import { FormFieldType } from './FormFieldType'
import { FieldObjectType } from './FieldObjectType'

export class FormSchemaHelper {
  public static getDeepValue(data: any, keys: string[]): any {
    if (keys.length === 0) {
      return data
    }
    if (!data || typeof data !== 'object') {
      return undefined
    }
    const [curKey, ...nextKeys] = keys
    return this.getDeepValue(data[curKey], nextKeys)
  }

  public static setDeepValue(data: any, keys: string[], value: any) {
    if (keys.length === 0) {
      return
    }
    if (!data || typeof data !== 'object') {
      return
    }
    const [curKey, ...nextKeys] = keys
    if (nextKeys.length === 0) {
      data[curKey] = value
      return
    }
    this.setDeepValue(data[curKey], nextKeys, value)
  }

  public static getFieldValue(data: any, field: FormField) {
    const fullKeys = field.fullKeys || [field.fieldKey]
    return this.getDeepValue(data, fullKeys)
  }

  public static setFieldValue(data: any, field: FormField, value: any) {
    const fullKeys = field.fullKeys || [field.fieldKey]
    this.setDeepValue(data, fullKeys, value)
  }

  public static flattenFields(fields: FormField[]) {
    const newFields: FormField[] = []
    const searchTree = (fields: FormField[]) => {
      fields.forEach((field) => {
        if (field.fieldType === FormFieldType.Object && field.extrasData.objectType === FieldObjectType.Form) {
          searchTree(field.subFields || [])
        } else {
          newFields.push(field)
        }
      })
    }
    searchTree(fields)
    return newFields
  }

  public static entityKeys(keys: string[]) {
    keys = [...keys]
    keys[keys.length - 1] = `${keys[keys.length - 1]}.$entity`
    return keys
  }

  public static extractMultiEnumItems(value: string): string[] {
    if (Array.isArray(value)) {
      return value
    }
    return (value || '')
      .split(/[,]/)
      .map((item) => item.trim())
      .filter((item) => !!item)
  }
}

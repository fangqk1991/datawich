import { FieldType, ModelFieldModel } from '../models'
import { SelectOption } from '@fangcha/tools'

export class GeneralDataHelper {
  public static extractCheckedMapForValue(value: number, field: ModelFieldModel) {
    if (field.fieldType !== FieldType.Tags) {
      return {}
    }
    const options = field.options
    const checkedMap: { [p: string]: boolean } = {}
    for (const option of options) {
      const bit = option.value as number
      checkedMap[bit] = (value & (1 << bit)) > 0
    }
    return checkedMap
  }

  public static extractMultiEnumItems(value: string) {
    return (value || '')
      .split(/[,]/)
      .map((item) => item.trim())
      .filter((item) => !!item)
  }

  public static extractMultiEnumCheckedMapForValue(value: string, options: SelectOption[]) {
    const tmpCheckMap = GeneralDataHelper.extractMultiEnumItems(value).reduce((result, cur) => {
      result[cur] = true
      return result
    }, {})
    const checkedMap: { [p: string]: boolean } = {}
    for (const option of options) {
      checkedMap[option.value] = !!tmpCheckMap[option.value]
    }
    return checkedMap
  }

  public static calculateMultiEnumValueWithCheckedMap(checkedMap: { [p: string]: boolean }) {
    return Object.keys(checkedMap)
      .filter((key) => checkedMap[key])
      .join(',')
  }

  public static calculateValueWithCheckedMap(checkedMap: { [p: string]: boolean }) {
    let value = 0
    Object.keys(checkedMap).forEach((code) => {
      if (checkedMap[code]) {
        const bit = Number(code)
        value += 1 << bit
      }
    })
    return value
  }

  public static getCheckedTagsForField(field: ModelFieldModel, checkedMap: { [p: string]: boolean }) {
    return field.options.filter((item) => checkedMap[item.value]).map((item) => item.label)
  }

  public static attachmentEntityKey(field: { fieldKey: string }) {
    return `${field.fieldKey}.entity`
  }

  public static calculateFilterKey(field: { modelKey: string; fieldKey: string }, superField?: { fieldKey: string }) {
    if (superField) {
      return `${superField.fieldKey}.${field.modelKey}.${field.fieldKey}`
    }
    return `${field.modelKey}.${field.fieldKey}`
  }

  public static calculateDataKey(field: { modelKey: string; fieldKey: string }, superField?: { fieldKey: string }) {
    if (superField) {
      return `${superField.fieldKey}.${field.modelKey}.${field.fieldKey}`
    }
    return field.fieldKey
  }

  public static inlineFieldDefaultName(superField: { name: string }, field: { name: string }) {
    return `${superField.name}'s ${field.name}`
  }
}

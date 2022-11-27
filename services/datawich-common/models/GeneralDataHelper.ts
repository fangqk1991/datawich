import { FieldType, ModelFieldModel } from './field'
import { Raw_ModelField } from './auto-build'
import { SelectOption } from '@fangcha/tools'

export const cleanDataByModelFields = (data: any, modelFields: Raw_ModelField[] = []) => {
  const realData: any = {}
  modelFields.forEach((field) => {
    const key = field.fieldKey
    if (key in data) {
      realData[key] = data[key]
      if (!realData[key]) {
        if (field.fieldType === FieldType.Enum || field.fieldType === FieldType.Tags) {
          realData[key] = 0
        } else if (field.fieldType === FieldType.JSON) {
          realData[key] = '{}'
        }
      }
    }
  })
  modelFields
    .filter(
      (field) =>
        [FieldType.Integer, FieldType.Float, FieldType.Date].includes(field.fieldType as FieldType) &&
        !field.required &&
        (realData[field.fieldKey] === '' || realData[field.fieldKey] === null)
    )
    .forEach((field) => {
      delete realData[field.fieldKey]
    })
  delete realData['create_time']
  delete realData['update_time']
  return realData
}

export const extractCheckedMapForValue = (value: number, field: ModelFieldModel) => {
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

export const extractMultiEnumItems = (value: string) => {
  return (value || '')
    .split(/[,]/)
    .map((item) => item.trim())
    .filter((item) => !!item)
}

export const extractMultiEnumCheckedMapForValue = (value: string, options: SelectOption[]) => {
  const tmpCheckMap = extractMultiEnumItems(value).reduce((result, cur) => {
    result[cur] = true
    return result
  }, {})
  const checkedMap: { [p: string]: boolean } = {}
  for (const option of options) {
    checkedMap[option.value] = !!tmpCheckMap[option.value]
  }
  return checkedMap
}

export const calculateMultiEnumValueWithCheckedMap = (checkedMap: { [p: string]: boolean }) => {
  return Object.keys(checkedMap)
    .filter((key) => checkedMap[key])
    .join(',')
}

export const transferLabelsToTagsValue = (labels: string[], label2ValueMap: { [p: string]: number }) => {
  labels = labels.map((item: string) => item.trim())
  const checkedMap: { [p: string]: boolean } = {}
  labels.forEach((label) => {
    if (label in label2ValueMap) {
      checkedMap[label2ValueMap[label]] = true
    }
  })
  return calculateValueWithCheckedMap(checkedMap)
}

export const calculateValueWithCheckedMap = (checkedMap: { [p: string]: boolean }) => {
  let value = 0
  Object.keys(checkedMap).forEach((code) => {
    if (checkedMap[code]) {
      const bit = Number(code)
      value += 1 << bit
    }
  })
  return value
}

export const getCheckedTagsForField = (field: ModelFieldModel, checkedMap: { [p: string]: boolean }) => {
  return field.options.filter((item) => checkedMap[item.value]).map((item) => item.label)
}

export const fieldWidgetStyle = (field: ModelFieldModel) => {
  const extrasData = field.extrasData || {}
  const width = extrasData['width'] || '200px'
  return `width: ${width}`
}

export const attachmentEntityKey = (field: { fieldKey: string }) => {
  return `${field.fieldKey}.entity`
}

export const calculateFilterKey = (
  field: { modelKey: string; fieldKey: string },
  superField?: { fieldKey: string }
) => {
  if (superField) {
    return `${superField.fieldKey}.${field.modelKey}.${field.fieldKey}`
  }
  return `${field.modelKey}.${field.fieldKey}`
}

export const calculateDataKey = (field: { modelKey: string; fieldKey: string }, superField?: { fieldKey: string }) => {
  if (superField) {
    return `${superField.fieldKey}.${field.modelKey}.${field.fieldKey}`
  }
  return field.fieldKey
}

export const inlineFieldDefaultName = (superField: { name: string }, field: { name: string }) => {
  return `${superField.name}'s ${field.name}`
}

export const makeDisplayFields = (fields: ModelFieldModel[]) => {
  const groupFieldMap: { [p: string]: ModelFieldModel } = {}
  const displayFields: ModelFieldModel[] = []
  for (const field of fields) {
    if (!field.groupKey) {
      displayFields.push(field)
      continue
    }
    if (!groupFieldMap[field.groupKey]) {
      const groupField = {
        modelKey: field.groupKey,
        fieldKey: '',
        name: field.groupName,
        fieldType: FieldType.Group,
        fieldDisplayMode: field.fieldDisplayMode,
        fieldDisplayTmpl: field.fieldDisplayTmpl,
        groupName: field.groupName,
        groupFields: [],
      } as Partial<ModelFieldModel>
      groupFieldMap[field.groupKey] = groupField as ModelFieldModel
      displayFields.push(groupField as ModelFieldModel)
    }
    groupFieldMap[field.groupKey].groupFields!.push(field)
  }
  return displayFields
}

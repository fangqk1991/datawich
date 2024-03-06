import { JsonChecker } from '@fangcha/tools'
import { LogicExpressionHelper } from '@fangcha/logic'
import * as moment from 'moment/moment'
import { FormField, SchemaFormFieldsMap } from './FormSchemaModels'
import { FormFieldType } from './FormFieldType'
import { OssFileInfo } from '@fangcha/oss-models'
import { FieldNumberType } from './FieldNumberType'
import { FieldEnumType } from './FieldEnumType'
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

  public static fillFieldsFullKeys(fields: FormField[], parentKeys: string[] = []) {
    fields.forEach((field) => {
      field.extrasData = field.extrasData || {}
      field.fullKeys = [...parentKeys, field.fieldKey]
      if (field.fieldType === FormFieldType.Object && field.extrasData.objectType === FieldObjectType.Form) {
        field.subFields = field.subFields || []
        this.fillFieldsFullKeys(field.subFields, field.fullKeys)
      }
    })
  }

  public static flattenFields(fields: FormField[]) {
    this.fillFieldsFullKeys(fields)
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

  public static makeFormFields<T extends {} = {}>(fieldsMap: SchemaFormFieldsMap<T>): FormField[] {
    const makeWords = (key: string) => {
      return key
        .split(/[.\-_ ]+/g)
        .map((item) => item.split(/(?=[A-Z]+)/).join(' '))
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join(' ')
    }
    return Object.keys(fieldsMap).map((fieldKey) => {
      const props = (
        typeof fieldsMap[fieldKey] === 'string'
          ? {
              fieldType: fieldsMap[fieldKey],
            }
          : fieldsMap[fieldKey]
      ) as FormField
      props.fieldKey = fieldKey
      props.name = props.name || makeWords(fieldKey)
      props.extrasData = props.extrasData || {}
      return props
    })
  }

  public static entityKeys(keys: string[]) {
    keys = [...keys]
    keys[keys.length - 1] = `${keys[keys.length - 1]}.$entity`
    return keys
  }

  public static entityKey(dataKey: string) {
    return `${dataKey}.$entity`
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

  public static calcSimpleInvalidMap(params: any, fields: FormField[], curDataId = '') {
    const errorMap: { [p: string]: string } = {}
    for (const field of fields) {
      if (field.fieldType === FormFieldType.Number) {
        if (params[field.fieldKey] === '') {
          delete params[field.fieldKey]
        }
      }
      let isRequired = field.isRequired
      if (field.extrasData.requiredLogic) {
        isRequired = LogicExpressionHelper.calcExpression(field.extrasData.requiredLogic, params)
      }
      if (!curDataId && isRequired) {
        if (params[field.fieldKey] === undefined || params[field.fieldKey] === null) {
          errorMap[field.fieldKey] = `${field.name} 不能为空`
          continue
        }
        if (field.fieldType === FormFieldType.String) {
          if (!params[field.fieldKey]) {
            errorMap[field.fieldKey] = `${field.name} 不能为空`
            continue
          }
        }
      }

      const value = params[field.fieldKey]
      if (value !== undefined && value !== null) {
        if (
          field.extrasData.enumType === FieldEnumType.Single ||
          field.extrasData.enumType === FieldEnumType.Multiple
        ) {
          if (!field.extrasData.value2LabelMap) {
            field.extrasData.value2LabelMap = (field.extrasData.options || []).reduce((result: any, cur: any) => {
              result[cur.value] = cur.label
              return result
            }, {})
          }
          const value2LabelMap = field.extrasData.value2LabelMap!
          if (field.extrasData.enumType === FieldEnumType.Single) {
            if (value !== '' && value2LabelMap[value] === undefined) {
              errorMap[field.fieldKey] = `${field.name} 有误，合法的枚举项为 { ${Object.keys(value2LabelMap)
                .map((value) => `${value}[${value2LabelMap[value]}]`)
                .join(' | ')} }`
            }
          } else if (field.extrasData.enumType === FieldEnumType.Multiple) {
            if (this.extractMultiEnumItems(value).find((key) => value2LabelMap[key] === undefined)) {
              errorMap[field.fieldKey] = `${field.name} 有误，合法的枚举项为 { ${Object.keys(value2LabelMap)
                .map((value) => `${value}[${value2LabelMap[value]}]`)
                .join(' | ')} }`
            }
          }
        }

        switch (field.fieldType as FormFieldType) {
          case FormFieldType.String:
            if (!field.extrasData.multipleLines) {
              if (`${value}`.length > 1024) {
                errorMap[field.fieldKey] = `${field.name} 的长度不能超过 1024`
              }
            }
            break
          case FormFieldType.Number:
            switch (field.extrasData.numberType!) {
              case FieldNumberType.Integer:
                if (!/^-?\d+$/.test(value)) {
                  errorMap[field.fieldKey] = `${field.name} 有误，请提交整数`
                }
                break
              case FieldNumberType.Float:
                if (!/^(-?\d+)$|^(-?\d+\.\d+)$/.test(value)) {
                  errorMap[field.fieldKey] = `${field.name} 有误，请提交数字`
                }
                break
            }
            break
          case FormFieldType.Boolean:
            break
          case FormFieldType.Date:
            if (value !== '' && !moment(value).isValid()) {
              errorMap[field.fieldKey] = `${field.name} 日期格式有误`
            }
            break
          case FormFieldType.Datetime:
            if (value !== '' && !moment(value).isValid()) {
              errorMap[field.fieldKey] = `${field.name} 时间格式有误`
            }
            break
          case FormFieldType.Object:
            switch (field.extrasData.objectType!) {
              case FieldObjectType.JSON:
                if (!JsonChecker.checkJSON(value)) {
                  errorMap[field.fieldKey] = `${field.name} 必须为标准 JSON 格式`
                }
                break
              case FieldObjectType.StringList:
                if (!Array.isArray(value) || value.find((item) => !(typeof item === 'string')) !== undefined) {
                  errorMap[field.fieldKey] = `${field.name} 必须为标准 string[] 格式`
                }
                break
              case FieldObjectType.Attachment:
                if (value) {
                  try {
                    const data: OssFileInfo = JSON.parse(value)
                    if (!data.ossKey) {
                      errorMap[field.fieldKey] = `${field.name} 附件 ossKey 有误`
                    }
                    if (!data.mimeType) {
                      errorMap[field.fieldKey] = `${field.name} 附件 mimeType 有误`
                    }
                    if (!data.size) {
                      errorMap[field.fieldKey] = `${field.name} 附件 size 有误`
                    }
                  } catch (e) {
                    errorMap[field.fieldKey] = `${field.name} 附件数据有误`
                  }
                }
                break
            }
            break
        }

        if (field.extrasData.matchRegex) {
          const pattern = new RegExp(field.extrasData.matchRegex)
          if (!pattern.test(value)) {
            errorMap[field.fieldKey] = `${field.name} 有误，需满足规则 ${field.extrasData.matchRegex}`
          }
        }
      }
    }
    return errorMap
  }
}

import { JsonChecker } from '@fangcha/tools'
import { LogicExpressionHelper } from '@fangcha/logic'
import * as moment from 'moment/moment'
import { FormField } from './FormSchemaModels'
import { FormFieldType } from './FormFieldType'
import { OssFileInfo } from '@fangcha/oss-models'
import { FieldNumberType } from './FieldNumberType'
import { FieldEnumType } from './FieldEnumType'
import { FieldObjectType } from './FieldObjectType'
import { FormSchemaHelper } from './FormSchemaHelper'

export class FormChecker {
  public readonly fields: FormField[]

  public constructor(fields: FormField[]) {
    this.fields = fields
  }

  public calcInvalidMap(params: any, checkRequiredProps = true) {
    const errorMap: { [p: string]: string } = {}
    for (const field of this.fields.filter((item) => !item.readonly)) {
      if (field.fieldType === FormFieldType.Number) {
        if (params[field.fieldKey] === '') {
          delete params[field.fieldKey]
        }
      }
      let isRequired = field.isRequired
      if (field.requiredLogic) {
        isRequired = LogicExpressionHelper.calcExpression(field.requiredLogic, params)
      }
      if (checkRequiredProps && isRequired) {
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
        if (field.enumType === FieldEnumType.Single || field.enumType === FieldEnumType.Multiple) {
          if (!field.value2LabelMap) {
            field.value2LabelMap = (field.options || []).reduce((result: any, cur: any) => {
              result[cur.value] = cur.label
              return result
            }, {})
          }
          const value2LabelMap = field.value2LabelMap!
          if (field.enumType === FieldEnumType.Single) {
            if (value !== '' && value2LabelMap[value] === undefined) {
              errorMap[field.fieldKey] = `${field.name} 有误，合法的枚举项为 { ${Object.keys(value2LabelMap)
                .map((value) => `${value}[${value2LabelMap[value]}]`)
                .join(' | ')} }`
            }
          } else if (field.enumType === FieldEnumType.Multiple) {
            if (FormSchemaHelper.extractMultiEnumItems(value).find((key) => value2LabelMap[key] === undefined)) {
              errorMap[field.fieldKey] = `${field.name} 有误，合法的枚举项为 { ${Object.keys(value2LabelMap)
                .map((value) => `${value}[${value2LabelMap[value]}]`)
                .join(' | ')} }`
            }
          }
        }

        switch (field.fieldType as FormFieldType) {
          case FormFieldType.String:
            if (!field.multipleLines) {
              if (`${value}`.length > 1024) {
                errorMap[field.fieldKey] = `${field.name} 的长度不能超过 1024`
              }
            }
            break
          case FormFieldType.Number:
            switch (field.numberType!) {
              case FieldNumberType.Integer:
                if (!/^-?\d+$/.test(value)) {
                  errorMap[field.fieldKey] = `${field.name} 有误，请提交整数`
                }
                break
              case FieldNumberType.Float:
                if (typeof value !== 'number' && !/^(-?\d+)$|^(-?\d+\.\d+)$/.test(value)) {
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
            switch (field.objectType!) {
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

        if (field.matchRegex) {
          const pattern = new RegExp(field.matchRegex)
          if (!pattern.test(value)) {
            errorMap[field.fieldKey] = `${field.name} 有误，需满足规则 ${field.matchRegex}`
          }
        }
      }
    }
    return errorMap
  }
}

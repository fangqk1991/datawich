import { ModelFieldModel } from './field/ModelFieldModel'
import { FieldType } from './field'
import * as moment from 'moment'
import { JsonChecker } from '@fangcha/tools'
import { extractMultiEnumItems } from './GeneralDataHelper'
import { LogicExpressionHelper } from './calc'

interface OssFileInfo {
  ossKey: string
  mimeType: string
  size: number
  url?: string
}

export class GeneralDataChecker {
  public static calcSimpleInvalidMap(params: any, fields: ModelFieldModel[], curDataId = '') {
    const errorMap: { [p: string]: string } = {}
    for (const field of fields) {
      if (field.fieldType === FieldType.Integer || field.fieldType === FieldType.Float) {
        if (params[field.fieldKey] === '') {
          delete params[field.fieldKey]
        }
      }
      let isRequired = !!field.required
      if (field.extrasData.requiredLogic) {
        isRequired = LogicExpressionHelper.calcExpression(field.extrasData.requiredLogic, params)
      }
      if (!curDataId && isRequired) {
        if (!(field.fieldKey in params)) {
          errorMap[field.fieldKey] = `${field.name} 不能为空`
          continue
        }
        if (
          field.fieldType === FieldType.SingleLineText ||
          field.fieldType === FieldType.MultipleLinesText ||
          field.fieldType === FieldType.RichText ||
          field.fieldType === FieldType.JSON ||
          field.fieldType === FieldType.Attachment
        ) {
          if (!params[field.fieldKey]) {
            errorMap[field.fieldKey] = `${field.name} 不能为空`
            continue
          }
        }
      }

      if (field.fieldKey in params) {
        const value = params[field.fieldKey]
        switch (field.fieldType as FieldType) {
          case FieldType.Unknown:
            break
          case FieldType.Integer:
            if (!/^-?\d+$/.test(value)) {
              errorMap[field.fieldKey] = `${field.name} 有误，请提交整数`
            }
            break
          case FieldType.Float:
            if (!/^(-?\d+)$|^(-?\d+\.\d+)$/.test(value)) {
              errorMap[field.fieldKey] = `${field.name} 有误，请提交数字`
            }
            break
          case FieldType.SingleLineText: {
            if (`${value}`.length > 1024) {
              errorMap[field.fieldKey] = `${field.name} 的长度不能超过 1024`
            }
            break
          }
          case FieldType.MultipleLinesText: {
            if (`${value}`.length > 16384) {
              errorMap[field.fieldKey] = `${field.name} 的长度不能超过 16384`
            }
            break
          }
          case FieldType.JSON: {
            if (!JsonChecker.checkJSON(value)) {
              errorMap[field.fieldKey] = `${field.name} 必须为标准 JSON 格式`
            }
            break
          }
          case FieldType.Enum:
          case FieldType.TextEnum: {
            const value2LabelMap = field.value2LabelMap
            if (!isRequired && !value) {
              break
            }
            if (!(value in value2LabelMap)) {
              errorMap[field.fieldKey] = `${field.name} 有误，合法的枚举项为 { ${Object.keys(value2LabelMap)
                .map((value) => `${value}[${value2LabelMap[value]}]`)
                .join(' | ')} }`
            }
            break
          }
          case FieldType.MultiEnum: {
            const value2LabelMap = field.value2LabelMap
            if (!isRequired && !value) {
              break
            }
            if (extractMultiEnumItems(value).find((key) => value2LabelMap[key] === undefined)) {
              errorMap[field.fieldKey] = `${field.name} 有误，合法的枚举项为 { ${Object.keys(value2LabelMap)
                .map((value) => `${value}[${value2LabelMap[value]}]`)
                .join(' | ')} }`
            }
            break
          }
          case FieldType.Tags: {
            const value2LabelMap = field.value2LabelMap
            if (typeof value !== 'number') {
              errorMap[field.fieldKey] = `${field.name} 有误，合法的标签项为 { ${Object.keys(value2LabelMap)
                .map((value) => `${value}[${value2LabelMap[value]}]`)
                .join(' | ')} }`
              break
            }
            let bit = 0
            let cur: number = value
            while (cur > 0) {
              if ((cur & 1) > 0) {
                if (!(bit in value2LabelMap)) {
                  errorMap[field.fieldKey] = `${field.name} 有误，合法的标签项为 { ${Object.keys(value2LabelMap)
                    .map((value) => `${value}[${value2LabelMap[value]}]`)
                    .join(' | ')} }`
                  break
                }
              }
              cur >>= 1
              ++bit
            }
            break
          }
          case FieldType.Date:
            if (!moment(value).isValid()) {
              errorMap[field.fieldKey] = `${field.name} 日期格式有误`
            }
            break
          case FieldType.Datetime:
            if (!moment(value).isValid()) {
              errorMap[field.fieldKey] = `${field.name} 时间格式有误`
            }
            break
          case FieldType.Attachment:
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
          case FieldType.User: {
            if (`${value}`.length > 127) {
              errorMap[field.fieldKey] = `${field.name} 的长度不能超过 127`
            }
            break
          }
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

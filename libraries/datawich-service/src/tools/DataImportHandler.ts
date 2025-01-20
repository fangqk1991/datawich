import * as moment from 'moment'
import { FieldEnumType, FormField, FormFieldType } from '@fangcha/form-models'
import { FieldHelper } from './FieldHelper'
import { GeneralDataHelper } from './GeneralDataHelper'

export class DataImportHandler {
  public readonly fields: FormField[]

  public constructor(fields: FormField[]) {
    this.fields = fields
  }

  public async extractRecordsFromRows(rows: any[]) {
    const records: any[] = []
    for (const item of rows) {
      if (Number(item._ignore) === 1) {
        continue
      }
      let data = this.decodeImportedData(item)
      const fields = this.fields
      data = FieldHelper.cleanDataByFormFields(data, fields)
      if (item['_data_id']) {
        data['_data_id'] = item['_data_id']
      }
      records.push(data)
    }
    return records
  }

  public decodeImportedData(importedData: any) {
    const realData: any = { ...importedData }
    this.fields.forEach((field) => {
      if (realData[field.fieldKey] === undefined && realData[field.name] !== undefined) {
        realData[field.fieldKey] = realData[field.name]
      }
      const label2ValueMap = (field.options || []).reduce((result: any, cur: any) => {
        result[cur.label] = cur.value
        return result
      }, {})

      if (field.enumType === FieldEnumType.Single) {
        if (field.fieldKey in realData) {
          const label = realData[field.fieldKey]
          if (label in label2ValueMap) {
            realData[field.fieldKey] = label2ValueMap[label]
          }
        }
      } else if (field.enumType === FieldEnumType.Multiple) {
        if (realData[field.fieldKey]) {
          // 处理不为空的描述值
          const labels: string[] = realData[field.fieldKey].split(',').map((item: string) => item.trim())
          const checkedMap: { [p: string]: boolean } = {}
          let valid = true
          labels.forEach((label) => {
            if (label in label2ValueMap) {
              checkedMap[label2ValueMap[label]] = true
            } else {
              valid = false
            }
          })
          if (valid) {
            realData[field.fieldKey] = GeneralDataHelper.calculateMultiEnumValueWithCheckedMap(checkedMap)
          }
        } else {
          realData[field.fieldKey] = ''
        }
      } else if (field.fieldType === FormFieldType.Date) {
        realData[field.fieldKey] = realData[field.fieldKey] ? moment(realData[field.fieldKey]).format('YYYY-MM-DD') : ''
      }
    })
    return realData
  }
}

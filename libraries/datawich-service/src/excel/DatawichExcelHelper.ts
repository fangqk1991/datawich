import * as moment from 'moment/moment'
import assert from '@fangcha/assert'
import { TypicalColumn, TypicalExcel } from '@fangcha/excel'
import { FT } from '@fangcha/tools'
import { FormField, FormFieldType } from '@fangcha/form-models'

export class DatawichExcelHelper {
  public static getFieldExampleValue(fieldType: FormFieldType) {
    switch (fieldType) {
      case FormFieldType.String:
        return 'Some text'
      case FormFieldType.Number:
        return 0
      case FormFieldType.Date:
        return '2023-08-01'
      case FormFieldType.Datetime:
        return '2023-08-01 00:00:00'
    }
    return 'Some text'
  }

  public static getTableExampleData(fieldItems: FormField[]) {
    return fieldItems.reduce((result, field) => {
      result[field.fieldKey] = this.getFieldExampleValue(field.fieldType)
      return result
    }, {})
  }

  public static transferExcelRecords(fieldItems: FormField[], records: any[]) {
    return records.map((rawData) => {
      const data: any = {}
      if (rawData.data_id) {
        data.data_id = rawData.data_id
      }
      fieldItems.forEach((field) => {
        data[field.fieldKey] = rawData[field.fieldKey] !== undefined ? rawData[field.fieldKey] : null
        if (field.fieldType === FormFieldType.Datetime && data[field.fieldKey]) {
          const time = moment(data[field.fieldKey])
          data[field.fieldKey] = time.isValid() ? time.format() : null
        }
      })
      return data
    })
  }

  public static purifyData(fieldItems: FormField[], data: any) {
    data = fieldItems
      .filter((field) => data[field.fieldKey] !== undefined)
      .reduce((result, field) => {
        result[field.fieldKey] = data[field.fieldKey]
        return result
      }, {})
    data = { ...data }
    fieldItems
      .filter((field) => field.fieldType !== FormFieldType.String)
      .forEach((field) => {
        if (data[field.fieldKey] === '') {
          data[field.fieldKey] = null
        }
      })
    for (const field of fieldItems) {
      const value = data[field.fieldKey]
      if (!value) {
        continue
      }
      switch (field.fieldType) {
        case FormFieldType.Number:
          assert.ok(!isNaN(value), `${field.name} 值格式有误`)
          break
        case FormFieldType.Date:
        case FormFieldType.Datetime:
          assert.ok(moment(value).isValid(), `${field.name} 值格式有误`)
          break
      }
    }
    return data
  }

  public static async makeExcelBuffer<T extends object = any>(fieldItems: FormField[], rowList: T[]) {
    const columns: TypicalColumn<T>[] = [
      ...fieldItems.map((field) => {
        if (field.fieldType === FormFieldType.Datetime) {
          return {
            columnKey: field.fieldKey,
            columnName: field.name,
            columnValue: (item: any) => {
              return item[field.fieldKey] ? FT(item[field.fieldKey]) : ''
            },
            width: field.width || 18,
          }
        }
        return {
          columnKey: field.fieldKey,
          columnName: field.name,
          width: field.width || 10,
        }
      }),
    ]
    const excel = TypicalExcel.excelWithTypicalColumns(columns)
    excel.addTypicalRowList(rowList)
    return excel.writeBuffer()
  }
}

import { TypicalExcel } from '@fangcha/tools/lib/excel'
import { Row } from 'exceljs'
import * as moment from 'moment'
import { _OSSResource, OSSService } from '@fangcha/oss-service'
import { ModelDataHandler } from './ModelDataHandler'
import { _DataModel } from '../models/extensions/_DataModel'
import { FieldType } from '@fangcha/datawich-service/lib/common/models'
import { GeneralDataHelper } from '@fangcha/datawich-service/lib/common/tools'
import { FieldHelper } from '@web/datawich-common/models'

const setHintRowStyle = (row: Row) => {
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF1CE' },
    }
    cell.font = {
      color: { argb: 'FFFF0007' },
    }
    cell.alignment = {
      wrapText: true,
    }
  })
}

interface ImportedRow {
  _ignore: number
  /**
   * @deprecated 暂时兼容旧的工时模板
   */
  ignore: number
}

export class DataImportHandler {
  private readonly _dataModel: _DataModel

  public constructor(dataModel: _DataModel) {
    this._dataModel = dataModel
  }

  public async exportDemoExcel() {
    const dataModel = this._dataModel
    const modelFields = await dataModel.getNormalFields()

    const columnKeys: string[] = []
    const nameRowData: any = {}
    const hintRowData: any = {}
    const exampleRowData: any = {}
    for (const field of modelFields) {
      columnKeys.push(field.fieldKey)
      nameRowData[field.fieldKey] = field.required ? `${field.name} *` : field.name
      hintRowData[field.fieldKey] = field.getHint()
      exampleRowData[field.fieldKey] = FieldHelper.getFieldNaturalLanguageValueExample(field.modelForClient())
    }
    {
      const key = '_ignore'
      columnKeys.push(key)
      nameRowData[key] = 1
      hintRowData[key] = 1
      exampleRowData[key] = 0
    }
    {
      const key = '_some_key_1'
      columnKeys.push(key)
      nameRowData[key] = '（_ignore = 1 的行不会被导入）'
      hintRowData[key] = '（枚举值及描述）'
      exampleRowData[key] = '（请参考本行格式录入数据，并删除本行）'
    }

    const excel = new TypicalExcel(columnKeys, {
      defaultColumnWidth: 12,
    })
    excel.setColumnWidth('_some_key_1', 38)
    excel.setColumnName('_some_key_1', '（请保留本行）')
    excel.useBorder = true
    {
      const row = excel.addExtraHeader(nameRowData)
      setHintRowStyle(row)
    }
    {
      const row = excel.addExtraHeader(hintRowData)
      setHintRowStyle(row)
    }
    excel.addRow(exampleRowData)

    return excel.writeBuffer()
  }

  public async extractRecordsFromResource(resource: _OSSResource) {
    const dataModel = this._dataModel
    const filePath = await OSSService.getResourceHandler(resource).getFilePath()
    const excel = await TypicalExcel.excelFromFile(filePath)
    const rows = excel.records() as ImportedRow[]
    const records: any[] = []
    for (const item of rows) {
      if (Number(item._ignore) === 1 || Number(item.ignore) === 1) {
        continue
      }
      let data = await this.decodeImportedData(item)
      data = await dataModel.getClearData(data)
      const invalidMap = await new ModelDataHandler(dataModel).getInvalidMap(data)
      data['invalidMap'] = invalidMap
      data['invalid'] = Object.keys(invalidMap).length > 0
      records.push(data)
    }
    return records
  }

  public async decodeImportedData(options: any) {
    const dataModel = this._dataModel
    const realData: any = { ...options }
    const fields = await dataModel.getFields()
    fields.forEach((field) => {
      if (field.fieldType === FieldType.Enum || field.fieldType === FieldType.TextEnum) {
        const dataMap = field.label2ValueMap()
        if (field.fieldKey in realData) {
          const label = realData[field.fieldKey]
          if (label in dataMap) {
            realData[field.fieldKey] = dataMap[label]
          }
        }
      } else if (field.fieldType === FieldType.Tags) {
        const dataMap = field.label2ValueMap()
        if (realData[field.fieldKey]) {
          // 处理不为空的描述值
          const labels: string[] = realData[field.fieldKey].split(',').map((item: string) => item.trim())
          const checkedMap: { [p: string]: boolean } = {}
          let valid = true
          labels.forEach((label) => {
            if (label in dataMap) {
              checkedMap[dataMap[label]] = true
            } else {
              valid = false
            }
          })
          if (valid) {
            realData[field.fieldKey] = GeneralDataHelper.calculateValueWithCheckedMap(checkedMap)
          }
        } else {
          realData[field.fieldKey] = 0
        }
      } else if (field.fieldType === FieldType.MultiEnum) {
        const dataMap = field.label2ValueMap()
        if (realData[field.fieldKey]) {
          // 处理不为空的描述值
          const labels: string[] = realData[field.fieldKey].split(',').map((item: string) => item.trim())
          const checkedMap: { [p: string]: boolean } = {}
          let valid = true
          labels.forEach((label) => {
            if (label in dataMap) {
              checkedMap[dataMap[label]] = true
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
      } else if (field.fieldType === FieldType.Date) {
        realData[field.fieldKey] = realData[field.fieldKey] ? moment(realData[field.fieldKey]).format('YYYY-MM-DD') : ''
      }
    })
    return realData
  }
}

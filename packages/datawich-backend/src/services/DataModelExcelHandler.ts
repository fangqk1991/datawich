import { Row } from 'exceljs'
import { _OSSResource, OSSService } from '@fangcha/oss-service'
import { _DataModel } from '../models/extensions/_DataModel'
import { DataImportHandler, FieldHelper, FieldType, transferModelFieldToFormField } from '@fangcha/datawich-service'
import { TypicalExcel } from '@fangcha/excel'

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

export class DataModelExcelHandler {
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
      hintRowData[field.fieldKey] = FieldHelper.getFieldHint({
        fieldType: field.fieldType as FieldType,
        options: field.options(),
      })
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
      records.push(data)
    }
    return records
  }

  public async decodeImportedData(options: any) {
    const fields = await this._dataModel.getFields()
    return new DataImportHandler(
      fields.map((item) => item.modelForClient()).map((field) => transferModelFieldToFormField(field))
    ).decodeImportedData(options)
  }
}

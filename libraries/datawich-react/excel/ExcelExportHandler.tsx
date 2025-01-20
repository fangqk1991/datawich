import { FormField } from '@fangcha/form-models'
import { DatawichExcelHelper } from '@fangcha/datawich-service/lib/excel'
const { saveAs } = require('file-saver')

interface Props {
  name: string
  fieldItems: FormField[]
}

export class ExcelExportHandler {
  public readonly table: Props

  constructor(table: Props) {
    this.table = table
  }

  public async exportExcel(fileName: string, rowList: any[]) {
    const buffer = await DatawichExcelHelper.makeExcelBuffer(this.table.fieldItems, rowList)
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, `${fileName}.xlsx`)
  }

  public async exportTemplateFile(examples: any[] = []) {
    return this.exportExcel(
      `${this.table.name}-模板`,
      examples.length > 0 ? examples : [DatawichExcelHelper.getTableExampleData(this.table.fieldItems)]
    )
  }

  public async exportRecords(records: any[]) {
    return this.exportExcel(`${this.table.name}-数据`, records)
  }
}

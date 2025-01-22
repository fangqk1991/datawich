import { ExcelPickButton, ExcelPickButtonProps } from '@fangcha/excel-react'
import { ExcelExportHandler } from './ExcelExportHandler'
import React from 'react'
import { DataImportHandler } from '@fangcha/datawich-service'
import { FormField } from '@fangcha/form-models'

export interface ImportButtonProps<T = any> extends ExcelPickButtonProps {
  fileName: string
  fieldItems: FormField[]
  exampleItems?: T[]
  onRecordPicked: (record: T, index: number, records: T[]) => Promise<void>
  onRecordsPickedDone: (records: T[]) => void | Promise<void>
}

export const ExcelImportButton: React.FC<ImportButtonProps> = ({
  fileName,
  fieldItems,
  exampleItems,
  onRecordPicked,
  onRecordsPickedDone,
  ...props
}) => {
  return (
    <ExcelPickButton
      // skipPreview={true}
      danger={true}
      filePickBtnText={'导入数据'}
      description={
        <ul>
          <li>
            <a
              onClick={async () => {
                const handler = new ExcelExportHandler({
                  name: fileName,
                  fieldItems: fieldItems,
                })
                await handler.exportTemplateFile(exampleItems || [])
              }}
            >
              模板下载
            </a>{' '}
          </li>
        </ul>
      }
      {...props}
      onPickExcel={async (excel) => {
        const records = await new DataImportHandler(fieldItems).extractRecordsFromRows(excel.records())
        for (let i = 0; i < records.length; ++i) {
          await onRecordPicked(records[i], i, records)
        }
        await onRecordsPickedDone(records)
      }}
    >
      导入 Excel
    </ExcelPickButton>
  )
}

import React from 'react'
import { TinyList } from './TinyList'
import { DataImportHandler, ModelFieldModel, transferModelFieldToFormField } from '@fangcha/datawich-service'
import { LoadingDialog, TextPreviewDialog } from '@fangcha/react'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DataAppApis } from '@web/datawich-common/admin-apis'
import { Button, Space } from 'antd'
import { ExcelPickButton } from '@fangcha/excel-react'

interface Props {
  modelKey: string
  fields: ModelFieldModel[]
  onImportDone?: () => void
}

export const DataImportButton: React.FC<Props> = ({ modelKey, fields, onImportDone }) => {
  return (
    <ExcelPickButton
      skipPreview={true}
      filePickBtnText={'导入数据'}
      columns={[
        {
          columnKey: 'data_id',
          columnName: 'data_id',
        },
        ...fields.map((item) => ({
          columnKey: item.fieldKey,
          columnName: item.name,
        })),
      ]}
      description={
        <ul>
          <li>_data_id 值存在时，将执行更新操作，否则执行创建操作</li>
        </ul>
      }
      onPickExcel={async (excel) => {
        await LoadingDialog.execute({
          handler: async (context) => {
            const errorItems: React.ReactNode[] = []
            const records = await new DataImportHandler(
              fields.map((field) => transferModelFieldToFormField(field))
            ).extractRecordsFromRows(excel.records())
            let succCount = 0
            for (let i = 0; i < records.length; ++i) {
              let succLi: React.ReactNode | null = null
              const todoItem = records[i]
              const request = MyRequest(new CommonAPI(DataAppApis.DataAppRecordPut, modelKey))
              request.setMute(true)
              request.setQueryParams({ forBatch: 1 })
              request.setBodyData(todoItem)
              await request
                .execute()
                .then(() => {
                  succLi = (
                    <li>
                      {i + 1} / {records.length} 导入成功
                    </li>
                  )
                  ++succCount
                })
                .catch(async (error) => {
                  errorItems.push(
                    <li>
                      {i + 1} / {records.length} 导入失败，
                      <b style={{ color: 'red' }}>{error.message}</b>
                      {' | '}
                      <a onClick={() => TextPreviewDialog.previewData(todoItem)}>查看</a>
                    </li>
                  )
                })

              context.setText(
                <TinyList>
                  {errorItems.map((item) => item)} {succLi}
                </TinyList>
              )
            }

            context.setText(
              <Space direction={'vertical'}>
                <h3>导入完成</h3>
                <div>
                  <b>{succCount}</b> 条数据导入成功，<b>{errorItems.length}</b> 条数据导入失败
                </div>
                <TinyList>{errorItems.map((item) => item)}</TinyList>
                <Button onClick={() => context.dismiss()}>关闭</Button>
              </Space>,
              true
            )
            // const request = MyRequest(new CommonAPI(DataAppApis.DataAppBatchRecordsPut, modelKey))
            // request.setBodyData(records)
            // await request.quickSend()
            onImportDone && onImportDone()
          },
          manualDismiss: true,
        })
      }}
    >
      导入 Excel
    </ExcelPickButton>
  )
}

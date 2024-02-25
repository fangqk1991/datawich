import React, { useEffect, useState } from 'react'
import { Button, Divider, Space } from 'antd'
import { DatabaseApis } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DBTable } from '@fangcha/datawich-service'
import { LoadingView, ReactPreviewDialog, TableView, TableViewColumn } from '@fangcha/react'
import { useParams } from 'react-router-dom'
import { TableFieldsTable } from './TableFieldsTable'

export const DBTableDetailView: React.FC = () => {
  const { tableName = '' } = useParams()

  const [tableSchema, setTableSchema] = useState<DBTable>()

  useEffect(() => {
    const request = MyRequest(new CommonAPI(DatabaseApis.TableSchemaGet, tableName))
    request.quickSend().then((response) => setTableSchema(response))
  }, [])

  if (!tableSchema) {
    return <LoadingView />
  }

  return (
    <div>
      <h3>{tableSchema.tableName}</h3>

      <Divider />

      <Space>
        <Button
          onClick={() => {
            const dialog = new ReactPreviewDialog({
              element: <TableFieldsTable table={tableSchema} />,
            })
            dialog.width = '90%'
            dialog.title = tableName
            dialog.show()
          }}
        >
          字段描述
        </Button>
      </Space>

      <Divider />

      <TableView
        rowKey={'_rid'}
        reactiveQuery={true}
        tableProps={{
          size: 'small',
          bordered: true,
        }}
        columns={TableViewColumn.makeColumns<any>([
          ...tableSchema.fields.map((field) => ({
            title: field.name,
            render: (data: any) => data[field.fieldKey],
          })),
        ])}
        defaultSettings={{
          pageSize: 15,
        }}
        loadData={async (retainParams) => {
          const request = MyRequest(new CommonAPI(DatabaseApis.RecordPageDataGet, tableName))
          request.setQueryParams(retainParams)
          return request.quickSend()
        }}
      />
    </div>
  )
}

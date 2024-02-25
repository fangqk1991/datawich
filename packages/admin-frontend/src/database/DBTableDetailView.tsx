import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { Button, Divider, message, Space } from 'antd'
import { DatabaseApis } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { CoreField, DBTable } from '@fangcha/datawich-service'
import { LoadingView, ReactPreviewDialog, TableView, TableViewColumn } from '@fangcha/react'
import { useParams } from 'react-router-dom'
import { TableFieldsTable } from './TableFieldsTable'
import { DBTableRecordDialog } from '@fangcha/datawich-react'

export const DBTableDetailView: React.FC = () => {
  const { tableName = '' } = useParams()

  const [tableSchema, setTableSchema] = useState<DBTable>()
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const request = MyRequest(new CommonAPI(DatabaseApis.TableSchemaGet, tableName))
    request.quickSend().then((response) => setTableSchema(response))
  }, [])

  const fields = useMemo(() => {
    if (!tableSchema) {
      return []
    }
    return tableSchema.fields
      .filter((item) => item.insertable)
      .map((schemaField): CoreField => {
        return {
          fieldKey: schemaField.fieldKey,
          fieldType: schemaField.fieldType,
          name: schemaField.name,
          required: schemaField.nullable ? 0 : 1,
          extrasData: {} as any,
        }
      })
  }, [tableSchema])

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

        <Button
          type={'primary'}
          onClick={() => {
            const dialog = new DBTableRecordDialog({
              table: tableSchema,
            })
            dialog.title = '创建数据记录'
            dialog.show(async (params) => {
              const request = MyRequest(new CommonAPI(DatabaseApis.RecordCreate, tableName))
              request.setBodyData(params)
              await request.execute()
              message.success('创建成功')
              forceUpdate()
            })
          }}
        >
          添加数据
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
          sortKey: '_rid',
          sortDirection: 'descend',
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

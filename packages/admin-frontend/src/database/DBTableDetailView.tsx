import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { Button, Divider, message, Space } from 'antd'
import { DatabaseApis } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { CoreField, DBConnection, DBTable } from '@fangcha/datawich-service'
import { LoadingView, ReactPreviewDialog, TableView, TableViewColumn, useQueryParams } from '@fangcha/react'
import { useNavigate, useParams } from 'react-router-dom'
import { TableFieldsTable } from './TableFieldsTable'
import { commonDataColumn, DBTableRecordDialog } from '@fangcha/datawich-react'

export const DBTableDetailView: React.FC = () => {
  const { connectionId = '', tableId = '' } = useParams()

  const [connection, setConnection] = useState<DBConnection>()
  const navigate = useNavigate()

  useEffect(() => {
    const request = MyRequest(new CommonAPI(DatabaseApis.ConnectionInfoGet, connectionId))
    request.quickSend().then((response) => setConnection(response))
  }, [connectionId])

  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams<{
    [p: string]: any
  }>()
  const [tableSchema, setTableSchema] = useState<DBTable>()
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const request = MyRequest(new CommonAPI(DatabaseApis.TableSchemaGet, connectionId, tableId))
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
          options: schemaField.options,
          extrasData: {} as any,
        }
      })
  }, [tableSchema])

  if (!connection || !tableSchema) {
    return <LoadingView />
  }
  const isMobile = window.innerWidth < 768

  return (
    <div>
      <h3>{tableSchema.tableId}</h3>

      <Divider />

      <Space>
        <Button
          onClick={() => {
            const dialog = new ReactPreviewDialog({
              element: <TableFieldsTable table={tableSchema} />,
            })
            dialog.width = '90%'
            dialog.title = tableId
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
              const request = MyRequest(new CommonAPI(DatabaseApis.RecordCreate, connectionId, tableId))
              request.setBodyData(params)
              await request.execute()
              message.success('创建成功')
              forceUpdate()
            })
          }}
        >
          添加数据
        </Button>

        <Button
          onClick={() => {
            setQueryParams({})
          }}
        >
          重置过滤器
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
          ...fields.map((field): any =>
            commonDataColumn({
              field: field,
              filterOptions: queryParams,
              onFilterChange: (params) => updateQueryParams(params),
            })
          ),
        ])}
        defaultSettings={{
          pageSize: 15,
          sortKey: '_rid',
          sortDirection: 'descend',
        }}
        loadData={async (retainParams) => {
          const request = MyRequest(new CommonAPI(DatabaseApis.RecordPageDataGet, connectionId, tableId))
          request.setQueryParams({
            ...retainParams,
            ...queryParams,
          })
          return request.quickSend()
        }}
      />
    </div>
  )
}

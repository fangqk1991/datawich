import React, { useMemo, useReducer } from 'react'
import { Button, Divider, message, Space } from 'antd'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DBTable, SdkDatabaseApis, SdkDBDataApis, transferDBFieldToCore } from '@fangcha/datawich-service'
import { ReactPreviewDialog, TableView, TableViewColumn, useQueryParams } from '@fangcha/react'
import { DBTableFieldsTable } from './DBTableFieldsTable'
import { DBTableRecordDialog } from './DBTableRecordDialog'
import { commonDataColumn } from './commonDataColumn'
import { DBRecordActionCell } from './DBRecordActionCell'

interface Props {
  connectionId?: string
  table: DBTable
}

export const DBDataTable: React.FC<Props> = (props) => {
  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams<{
    [p: string]: any
  }>()
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)
  const connectionId = props.connectionId || '-'
  const tableSchema = props.table

  const fields = useMemo(() => tableSchema.fields.map((item) => transferDBFieldToCore(item)), [tableSchema])

  return (
    <div>
      <Space>
        <Button
          onClick={() => {
            const dialog = new ReactPreviewDialog({
              element: <DBTableFieldsTable connectionId={connectionId} table={tableSchema} hideActions={true} />,
            })
            dialog.width = '90%'
            dialog.title = tableSchema.name || tableSchema.tableId
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
              const request = MyRequest(new CommonAPI(SdkDBDataApis.RecordCreate, connectionId, tableSchema.tableId))
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
        rowKey={tableSchema.primaryKey}
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
          {
            title: '操作',
            fixed: 'right',
            align: 'center',
            render: (item) => (
              <DBRecordActionCell
                connectionId={connectionId}
                table={tableSchema}
                record={item}
                onDataChanged={forceUpdate}
              />
            ),
          },
        ])}
        defaultSettings={{
          pageSize: 15,
          sortKey: '_rid',
          sortDirection: 'descend',
        }}
        loadData={async (retainParams) => {
          const request = MyRequest(new CommonAPI(SdkDBDataApis.RecordPageDataGet, connectionId, tableSchema.tableId))
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

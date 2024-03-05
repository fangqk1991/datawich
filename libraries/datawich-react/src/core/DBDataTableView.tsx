import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { Button, Divider, message, Space } from 'antd'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DBTable, SdkDBDataApis, transferDBFieldToCore, transferDBFieldToFormField } from '@fangcha/datawich-service'
import { LoadingView, ReactPreviewDialog, TableView, TableViewColumn, useQueryParams } from '@fangcha/react'
import { DBTableInfoView } from './DBTableInfoView'
import { commonDataColumn } from './commonDataColumn'
import { DBRecordActionCell } from './DBRecordActionCell'
import { useParams } from 'react-router-dom'
import { showDBDataDescriptions } from './DBDataDescriptions'
import { CommonFormDialog } from '@fangcha/form-react'

interface Props {}

export const DBDataTableView: React.FC<Props> = (props) => {
  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams<{
    [p: string]: any
  }>()
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)
  const { connectionId = '-', tableId = '' } = useParams()

  const [tableSchema, setTableSchema] = useState<DBTable>()

  useEffect(() => {
    const request = MyRequest(new CommonAPI(SdkDBDataApis.TableSchemaGet, connectionId, tableId))
    request.quickSend().then((response) => setTableSchema(response))
  }, [tableId])

  const fields = useMemo(() => (tableSchema?.fields || []).map((item) => transferDBFieldToCore(item)), [tableSchema])

  if (!tableSchema) {
    return <LoadingView />
  }

  return (
    <div>
      <h4>{tableSchema.name || tableSchema.tableId}</h4>

      <Divider />

      <Space>
        <Button
          onClick={() => {
            const dialog = new ReactPreviewDialog({
              element: <DBTableInfoView connectionId={connectionId} table={tableSchema} />,
            })
            dialog.width = '90%'
            dialog.title = tableSchema.name || tableSchema.tableId
            dialog.show()
          }}
        >
          表描述
        </Button>

        <Button
          type={'primary'}
          onClick={() => {
            const dialog = new CommonFormDialog({
              fields: tableSchema.fields.map((field) => transferDBFieldToFormField(field)),
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
          onRow: (record) => {
            return {
              onDoubleClick: () => {
                showDBDataDescriptions({
                  connectionId: connectionId,
                  table: tableSchema,
                  record: record,
                  onDataChanged: forceUpdate,
                })
              },
            }
          },
        }}
        columns={TableViewColumn.makeColumns<any>([
          ...fields
            .filter((field) => !field.hidden)
            .map((field): any =>
              commonDataColumn({
                field: field,
                filterOptions: queryParams,
                onFilterChange: (params) => updateQueryParams(params),
                updateRecord: async (data, params) => {
                  const request = MyRequest(
                    new CommonAPI(
                      SdkDBDataApis.RecordUpdate,
                      connectionId,
                      tableSchema.tableId,
                      data[tableSchema.primaryKey]
                    )
                  )
                  request.setBodyData(params)
                  await request.execute()
                  message.success('修改成功')
                  forceUpdate()
                },
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

import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { Button, Divider, message, Space } from 'antd'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DBTable, SdkDBDataApis } from '@fangcha/datawich-service'
import {
  LoadingView,
  ReactPreviewDialog,
  TablePageOptions,
  TableParamsHelper,
  TableViewColumn,
  TableViewV2,
  useLoadingData,
  useQueryParams,
} from '@fangcha/react'
import { DBTableInfoView } from './DBTableInfoView'
import { commonDataColumn } from './commonDataColumn'
import { DBRecordActionCell } from './DBRecordActionCell'
import { useParams } from 'react-router-dom'
import { CommonFormDialog } from '@fangcha/form-react'
import { PageResult } from '@fangcha/tools'

const __defaultParams: TablePageOptions = {
  pageSize: 15,
  sortKey: '_rid',
  sortDirection: 'descend',
}

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

  const fields = useMemo(() => tableSchema?.fields || [], [tableSchema])

  const { loading, data: pageResult } = useLoadingData<PageResult>(
    async () => {
      if (!tableSchema) {
        return { offset: 0, length: 20, totalCount: 0, items: [] }
      }
      const request = MyRequest(new CommonAPI(SdkDBDataApis.RecordPageDataGet, connectionId, tableSchema.tableId))
      request.setQueryParams(
        TableParamsHelper.transferQueryParams({
          ...__defaultParams,
          ...queryParams,
        })
      )
      return request.quickSend()
    },
    [tableSchema, queryParams],
    { offset: 0, length: 20, totalCount: 0, items: [] }
  )

  if (!tableSchema) {
    return <LoadingView />
  }

  return (
    <div>
      <h3>{tableSchema.name || tableSchema.tableId}</h3>

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
              fields: fields,
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

      <TableViewV2
        rowKey={tableSchema.primaryKey}
        tableProps={{
          size: 'small',
          bordered: true,
          loading: loading,
          // onRow: (record) => {
          //   return {
          //     onDoubleClick: () => {
          //       showDBDataDescriptions({
          //         connectionId: connectionId,
          //         table: tableSchema,
          //         record: record,
          //         onDataChanged: forceUpdate,
          //       })
          //     },
          //   }
          // },
        }}
        columns={TableViewColumn.makeColumns<any>([
          ...fields
            .filter((field) => !field.notVisible)
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
        initialSettings={__defaultParams}
        pageResult={pageResult}
        onParamsChanged={(params) => {
          // console.info('onParamsChanged', params)
          updateQueryParams(params as any)
        }}
      />
    </div>
  )
}

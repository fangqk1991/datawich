import React, { useEffect, useReducer, useState } from 'react'
import { Breadcrumb, Descriptions, Divider } from 'antd'
import { DatabaseApis, DatawichAdminPages } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DBTable } from '@fangcha/datawich-service'
import { LoadingView, RouterLink } from '@fangcha/react'
import { useParams } from 'react-router-dom'
import { TableFieldsTable } from './TableFieldsTable'
import { useConnection } from './useConnection'

export const DBTableDetailView: React.FC = () => {
  const { connectionId = '', tableId = '' } = useParams()

  const connection = useConnection()

  const [tableSchema, setTableSchema] = useState<DBTable>()
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const request = MyRequest(new CommonAPI(DatabaseApis.TableSchemaGet, connectionId, tableId))
    request.quickSend().then((response) => setTableSchema(response))
  }, [])

  if (!connection || !tableSchema) {
    return <LoadingView />
  }

  return (
    <div>
      <Breadcrumb
        items={[
          {
            title: <RouterLink route={DatawichAdminPages.DatabaseConnectionListRoute}>Connections</RouterLink>,
          },
          {
            title: (
              <RouterLink route={DatawichAdminPages.DatabaseDetailRoute} params={[connectionId]}>
                {connection.dbName}
              </RouterLink>
            ),
          },
          {
            title: tableSchema.tableId,
          },
        ]}
      />
      <Divider />

      <Descriptions title='基本信息'>
        <Descriptions.Item label='表名'>{tableSchema.tableId}</Descriptions.Item>
        <Descriptions.Item label='主键'>{tableSchema.primaryKey}</Descriptions.Item>
        <Descriptions.Item label='别名'>{tableSchema.name}</Descriptions.Item>
        <Descriptions.Item label='信息'>{tableSchema.fields.length} fields</Descriptions.Item>
        <Descriptions.Item>
          <RouterLink route={DatawichAdminPages.DatabaseTableDataRoute} params={[connectionId, tableId]}>
            查看数据
          </RouterLink>
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <TableFieldsTable table={tableSchema} />
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Breadcrumb, Divider } from 'antd'
import { DatawichAdminPages } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DBTable, SdkDBDataApis } from '@fangcha/datawich-service'
import { LoadingView, RouterLink } from '@fangcha/react'
import { useParams } from 'react-router-dom'
import { DBDataTableView, useConnection } from '@fangcha/datawich-react'

export const DBTableDataView: React.FC = () => {
  const { connectionId = '', tableId = '' } = useParams()

  const connection = useConnection()
  const [tableSchema, setTableSchema] = useState<DBTable>()

  useEffect(() => {
    const request = MyRequest(new CommonAPI(SdkDBDataApis.TableSchemaGet, connectionId, tableId))
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
            title: (
              <RouterLink route={DatawichAdminPages.DatabaseTableDetailRoute} params={[connectionId, tableId]}>
                {tableSchema.name}
              </RouterLink>
            ),
          },
          {
            title: 'Data',
          },
        ]}
      />
      <Divider />

      <DBDataTableView />
    </div>
  )
}

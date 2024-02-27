import React, { useEffect, useState } from 'react'
import { Breadcrumb, Card, Descriptions, Divider } from 'antd'
import { DatabaseApis, DatawichAdminPages } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { useNavigate, useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { DBSchema } from '@fangcha/datawich-service'
import { LoadingView, RouterLink } from '@fangcha/react'

export const DatabaseDetailView: React.FC = () => {
  const { connectionId = '' } = useParams()

  const [dbSchema, setDBSchema] = useState<DBSchema>()
  const navigate = useNavigate()

  useEffect(() => {
    const request = MyRequest(new CommonAPI(DatabaseApis.DatabaseSchemaGet, connectionId))
    request.quickSend().then((response) => setDBSchema(response))
  }, [connectionId])

  if (!dbSchema) {
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
            title: dbSchema.dbName,
          },
        ]}
      />
      <Divider />

      <Descriptions title={'基本信息'}>
        <Descriptions.Item label='Host'>{dbSchema.dbHost}</Descriptions.Item>
        <Descriptions.Item label='Port'>{dbSchema.dbPort}</Descriptions.Item>
        <Descriptions.Item label='DB Name'>{dbSchema.dbName}</Descriptions.Item>
        <Descriptions.Item label='User'>{dbSchema.username}</Descriptions.Item>
        <Descriptions.Item label='Info'>{dbSchema.tables.length} tables</Descriptions.Item>
      </Descriptions>

      <Divider />

      <Card size={'small'}>
        {dbSchema.tables.map((table) => (
          <Card.Grid
            style={{
              cursor: 'pointer',
              padding: '16px',
            }}
            onClick={() => {
              navigate(
                DatawichAdminPages.buildRoute(DatawichAdminPages.DatabaseTableDetailRoute, [connectionId, table])
              )
            }}
            key={table}
          >
            {table}
          </Card.Grid>
        ))}
      </Card>
    </div>
  )
}

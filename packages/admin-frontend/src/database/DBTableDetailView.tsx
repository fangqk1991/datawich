import React, { useEffect, useState } from 'react'
import { Breadcrumb, Descriptions, Divider, message, Select, Space } from 'antd'
import { DatawichAdminPages } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DBTable, OpenLevelDescriptor, SdkDatabaseApis, SdkDBDataApis } from '@fangcha/datawich-service'
import { LoadingView, RouterLink, SimpleInputDialog } from '@fangcha/react'
import { useParams } from 'react-router-dom'
import { DBTableFieldsTable, useConnection } from '@fangcha/datawich-react'

export const DBTableDetailView: React.FC = () => {
  const { connectionId = '', tableId = '' } = useParams()

  const connection = useConnection()

  const [tableSchema, setTableSchema] = useState<DBTable>()
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const request = MyRequest(new CommonAPI(SdkDBDataApis.TableSchemaGet, connectionId, tableId))
    request.quickSend().then((response) => setTableSchema(response))
  }, [version])

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
        <Descriptions.Item label='别名'>
          <Space>
            {tableSchema.name} |
            <a
              onClick={() => {
                const dialog = new SimpleInputDialog({
                  curValue: tableSchema!.name,
                })
                dialog.show(async (name) => {
                  const request = MyRequest(new CommonAPI(SdkDatabaseApis.TableSchemaUpdate, connectionId, tableId))
                  request.setBodyData({
                    name: name,
                  })
                  await request.quickSend()
                  setVersion(version + 1)
                  message.success('更新成功')
                })
              }}
            >
              编辑
            </a>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label='仅自己可见'>
          <Select
            size={'small'}
            style={{ width: '150px' }}
            placeholder='Please select'
            value={tableSchema.openLevel}
            onChange={async (openLevel) => {
              const request = MyRequest(new CommonAPI(SdkDatabaseApis.TableSchemaUpdate, connectionId, tableId))
              request.setBodyData({
                openLevel: openLevel,
              })
              await request.quickSend()
              setVersion(version + 1)
              message.success('更新成功')
            }}
            options={OpenLevelDescriptor.options()}
          />
        </Descriptions.Item>
        <Descriptions.Item label='信息'>{tableSchema.fields.length} fields</Descriptions.Item>
        <Descriptions.Item>
          <RouterLink route={DatawichAdminPages.DatabaseTableDataRoute} params={[connectionId, tableId]}>
            查看数据
          </RouterLink>
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <DBTableFieldsTable
        connectionId={connectionId}
        table={tableSchema}
        onDataChanged={() => setVersion(version + 1)}
      />
    </div>
  )
}

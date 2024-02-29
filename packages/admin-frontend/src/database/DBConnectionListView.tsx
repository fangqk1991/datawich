import React, { useEffect, useState } from 'react'
import { Button, Divider, message, Space, Table } from 'antd'
import { DBConnection, SdkDatabaseApis } from '@fangcha/datawich-service'
import { DatawichAdminPages } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { ConfirmDialog, RouterLink, TableViewColumn } from '@fangcha/react'
import { makeDBConnectionDialog } from './makeDBConnectionDialog'
import { CommonAPI } from '@fangcha/app-request'

export const DBConnectionListView: React.FC = () => {
  const [connectionList, setConnectionList] = useState<DBConnection[]>([])
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const request = MyRequest(SdkDatabaseApis.ConnectionListGet)
    request.quickSend().then((response) => setConnectionList(response))
  }, [version])

  return (
    <div>
      <h3>Connections</h3>
      <Divider />
      <Space>
        <Button
          type='primary'
          onClick={() => {
            const dialog = makeDBConnectionDialog()
            dialog.show(async (params) => {
              const request = MyRequest(SdkDatabaseApis.ConnectionCreate)
              request.setBodyData(params)
              await request.quickSend()
              message.success('创建成功')
              setVersion(version + 1)
            })
          }}
        >
          创建
        </Button>
      </Space>
      <Divider />
      <Table
        size={'small'}
        rowKey={(item) => item.uid}
        columns={TableViewColumn.makeColumns<DBConnection>([
          {
            title: '#',
            render: (item) => (
              <RouterLink route={DatawichAdminPages.DatabaseDetailRoute} params={[item.uid]}>
                {item.uid}
              </RouterLink>
            ),
          },
          {
            title: 'Host',
            render: (item) => item.dbHost,
          },
          {
            title: 'DB',
            render: (item) => (
              <RouterLink route={DatawichAdminPages.DatabaseDetailRoute} params={[item.uid]}>
                {item.dbName}
              </RouterLink>
            ),
          },
          {
            title: 'User',
            render: (item) => item.username,
          },
          {
            title: '操作',
            render: (item) => {
              return (
                <Space>
                  <a
                    className={'text-success'}
                    onClick={async () => {
                      const request = MyRequest(new CommonAPI(SdkDatabaseApis.ConnectionPing, item.uid))
                      await request.quickSend()
                      message.success('连接测试成功')
                    }}
                  >
                    Ping
                  </a>
                  <a
                    onClick={() => {
                      const dialog = makeDBConnectionDialog(item)
                      dialog.show(async (params) => {
                        const request = MyRequest(new CommonAPI(SdkDatabaseApis.ConnectionUpdate, item.uid))
                        request.setBodyData(params)
                        await request.quickSend()
                        message.success('更新成功')
                        setVersion(version + 1)
                      })
                    }}
                  >
                    编辑
                  </a>
                  <a
                    className={'text-success'}
                    onClick={async () => {
                      const dialog = makeDBConnectionDialog(item)
                      dialog.title = '创建连接信息'
                      dialog.show(async (params) => {
                        const request = MyRequest(new CommonAPI(SdkDatabaseApis.ConnectionCreate))
                        request.setBodyData(params)
                        await request.quickSend()
                        message.success('创建成功')
                        setVersion(version + 1)
                      })
                    }}
                  >
                    复制
                  </a>
                  <a
                    className={'text-danger'}
                    onClick={async () => {
                      const dialog = new ConfirmDialog({
                        title: '删除连接',
                        content: `确定要删除此连接吗？`,
                      })
                      dialog.show(async () => {
                        const request = MyRequest(new CommonAPI(SdkDatabaseApis.ConnectionDelete, item.uid))
                        await request.execute()
                        message.success('删除成功')
                        setVersion(version + 1)
                      })
                    }}
                  >
                    删除
                  </a>
                </Space>
              )
            },
          },
        ])}
        dataSource={connectionList}
        pagination={false}
      />
    </div>
  )
}

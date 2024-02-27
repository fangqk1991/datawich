import React, { useEffect, useState } from 'react'
import { Button, Divider, message, Space, Table } from 'antd'
import { DBConnection } from '@fangcha/datawich-service'
import { DatabaseApis } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { TableViewColumn } from '@fangcha/react'
import { makeDBConnectionDialog } from './makeDBConnectionDialog'

export const DBConnectionListView: React.FC = () => {
  const [connectionList, setConnectionList] = useState<DBConnection[]>([])
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const request = MyRequest(DatabaseApis.ConnectionListGet)
    request.quickSend().then((response) => setConnectionList(response))
  }, [version])

  return (
    <div>
      <h3>DB Connections</h3>
      <Divider />
      <Space>
        <Button
          type='primary'
          onClick={() => {
            const dialog = makeDBConnectionDialog()
            dialog.show(async (params) => {
              const request = MyRequest(DatabaseApis.ConnectionCreate)
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
            render: (item) => item.uid,
          },
          {
            title: 'Host',
            render: (item) => item.dbHost,
          },
          {
            title: 'DB',
            render: (item) => item.dbName,
          },
          {
            title: 'User',
            render: (item) => item.username,
          },
        ])}
        dataSource={connectionList}
        pagination={false}
      />
    </div>
  )
}

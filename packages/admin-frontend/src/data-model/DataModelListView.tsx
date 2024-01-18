import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Button, Card, Divider, message, Space, Spin } from 'antd'
import { DataAppApis, DataModelApis } from '@web/datawich-common/web-api'
import { DataModelModel } from '@fangcha/datawich-service'
import { LS } from '../core/ReactI18n'
import { DataModelCard } from './DataModelCard'
import { JsonEditorDialog } from '@fangcha/react'
import { DataModelDialog } from './DataModelDialog'

export const DataModelListView: React.FC = () => {
  const [appList, setAppList] = useState<DataModelModel[]>()
  const [version, setVersion] = useState(0)

  useEffect(() => {
    MyRequest(DataAppApis.DataAppListGet)
      .quickSend()
      .then((response) => {
        setAppList(response)
      })
  }, [version])

  if (!appList) {
    return <Spin size='large' />
  }

  return (
    <div>
      <Breadcrumb
        items={[
          {
            title: LS('[i18n] Model List'),
          },
        ]}
      />
      <Divider />
      <Space>
        <Button
          type='primary'
          onClick={() => {
            const dialog = new DataModelDialog({
              title: '创建模型',
            })
            dialog.show(async (params) => {
              const request = MyRequest(DataModelApis.DataModelCreate)
              request.setBodyData(params)
              await request.quickSend()
              message.success('创建成功')
              setVersion(version + 1)
            })
          }}
        >
          创建
        </Button>
        <Button
          onClick={() => {
            const dialog = new JsonEditorDialog({
              title: '导入模型 JSON',
            })
            dialog.show(async (params) => {
              const request = MyRequest(DataModelApis.DataModelImport)
              request.setBodyData(params)
              await request.quickSend()
              message.success('导入成功')
              setVersion(version + 1)
            })
          }}
        >
          导入
        </Button>
      </Space>
      <Divider />
      <Card>
        {appList.map((dataApp) => (
          <Card.Grid
            style={{
              cursor: 'pointer',
              padding: '16px',
            }}
            key={dataApp.modelKey}
          >
            <DataModelCard dataApp={dataApp} />
          </Card.Grid>
        ))}
      </Card>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { LS } from '../core/ReactI18n'
import { Button, Card, Divider, Space } from 'antd'
import { DataModelModel } from '@fangcha/datawich-service'
import { DataAppApis, DatawichClientApis } from '@web/datawich-common/web-api'
import { MyRequest } from '@fangcha/auth-react'
import { ModelClientModel } from '@web/datawich-common/models'
import { ModelClientCard } from './ModelClientCard'
import { makeClientFormDialog } from './makeClientFormDialog'
import { ReactPreviewDialog } from '@fangcha/react'

export const ModelClientListView: React.FC = () => {
  const [modelList, setModelList] = useState<DataModelModel[]>([])
  const [clientList, setClientList] = useState<ModelClientModel[]>([])
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const request = MyRequest(DataAppApis.DataAppListGet)
    request.setQueryParams({ isOnline: '' })
    request.quickSend().then((response) => setModelList(response))
  }, [])

  useEffect(() => {
    const request = MyRequest(DatawichClientApis.ModelClientListGet)
    request.quickSend().then((response) => setClientList(response))
  }, [version])

  return (
    <div>
      <h3>{LS('[i18n] API Clients')}</h3>
      <Divider />
      <Space>
        <Button
          type='primary'
          onClick={() => {
            const dialog = makeClientFormDialog()
            dialog.show(async (params) => {
              const request = MyRequest(DatawichClientApis.ModelClientCreate)
              request.setBodyData(params)
              const data = await request.quickSend<ModelClientModel>()
              new ReactPreviewDialog({
                title: '创建成功',
                element: (
                  <div>
                    请保存此 App Secret [<b>{data.appSecret}</b>]（只在本次展示）
                  </div>
                ),
              }).show()
              setVersion(version + 1)
            })
          }}
        >
          创建
        </Button>
      </Space>
      <Divider />
      <Card>
        {clientList.map((client) => (
          <Card.Grid
            style={{
              cursor: 'pointer',
              padding: '16px',
            }}
            key={client.appid}
          >
            <ModelClientCard client={client} modelList={modelList} onClientChanged={() => setVersion(version + 1)} />
          </Card.Grid>
        ))}
      </Card>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Card, Divider, Spin } from 'antd'
import { DataAppApis } from '@web/datawich-common/web-api'
import { DataModelModel } from '@fangcha/datawich-service/lib'
import { useNavigate } from 'react-router-dom'
import { LS } from '../core/ReactI18n'

export const DataModelListView: React.FC = () => {
  const [appList, setAppList] = useState<DataModelModel[]>()
  const navigate = useNavigate()

  useEffect(() => {
    MyRequest(DataAppApis.DataAppListGet)
      .quickSend()
      .then((response) => {
        setAppList(response)
      })
  }, [])

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
      <Divider style={{ margin: '12px 0' }} />
      <Card>
        {appList.map((dataApp) => (
          <Card.Grid
            style={{
              cursor: 'pointer',
            }}
            key={dataApp.modelKey}
            onClick={() => {
              navigate(`/v1/data-app/${dataApp.modelKey}`)
            }}
          >
            <b>{dataApp.name}</b>
          </Card.Grid>
        ))}
      </Card>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Card, Divider, Spin } from 'antd'
import { DataModelModel } from '@fangcha/datawich-service'
import { useNavigate } from 'react-router-dom'
import { useFavorAppsCtx } from '../profile/FavorAppsContext'
import { ApiOptions } from '@fangcha/app-request'

interface Props {
  apis: {
    getAppList: ApiOptions
  }
  appPage: (modelKey: string) => string
}

export const DataAppListView: React.FC<Props> = ({ apis, appPage }) => {
  const [appList, setAppList] = useState<DataModelModel[]>()
  const navigate = useNavigate()
  const favorAppsCtx = useFavorAppsCtx()

  useEffect(() => {
    MyRequest(apis.getAppList)
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
            title: '数据应用',
          },
        ]}
      />

      <Divider style={{ margin: '12px 0' }} />

      <Card>
        {appList
          .filter((item) => item.isOnline)
          .map((dataApp) => (
            <Card.Grid
              style={{
                cursor: 'pointer',
              }}
              key={dataApp.modelKey}
              onClick={() => {
                navigate(appPage(dataApp.modelKey))
              }}
            >
              <b>
                {dataApp.name} {!!favorAppsCtx.favorMap[dataApp.modelKey] && '⭐️'}
              </b>
            </Card.Grid>
          ))}
      </Card>
    </div>
  )
}

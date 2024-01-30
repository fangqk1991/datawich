import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Card, Divider, Spin } from 'antd'
import { DataModelModel, SdkDatawichApis, SdkDatawichPages } from '@fangcha/datawich-service'
import { useNavigate } from 'react-router-dom'
import { useFavorAppsCtx } from '../profile/FavorAppsContext'
import { ApiOptions } from '@fangcha/app-request'

interface Props {
  appPage?: (modelKey: string) => string
  api_AppListGet?: ApiOptions
}

export const DataAppListView: React.FC<Props> = ({ api_AppListGet, appPage }) => {
  api_AppListGet = api_AppListGet || SdkDatawichApis.ModelListGet

  const [appList, setAppList] = useState<DataModelModel[]>()
  const navigate = useNavigate()
  const favorAppsCtx = useFavorAppsCtx()

  useEffect(() => {
    MyRequest(api_AppListGet)
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
                navigate(
                  appPage
                    ? appPage(dataApp.modelKey)
                    : SdkDatawichPages.buildRoute(SdkDatawichPages.WebAppDetailRoute, [dataApp.modelKey])
                )
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

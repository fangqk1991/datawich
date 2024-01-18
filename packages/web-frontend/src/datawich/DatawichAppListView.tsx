import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Card, Divider, Spin } from 'antd'
import { DataModelModel, SdkDatawichApis } from '@fangcha/datawich-service'
import { useNavigate } from 'react-router-dom'
import { DatawichWebPages } from '@web/datawich-common/web-apis'

export const DatawichAppListView: React.FC = () => {
  const [appList, setAppList] = useState<DataModelModel[]>()
  const navigate = useNavigate()

  useEffect(() => {
    MyRequest(SdkDatawichApis.ModelListGet)
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
        {appList.map((dataApp) => (
          <Card.Grid
            style={{
              cursor: 'pointer',
            }}
            key={dataApp.modelKey}
            onClick={() => {
              navigate(DatawichWebPages.buildRoute(DatawichWebPages.DatawichAppDetailRoute, [dataApp.modelKey]))
            }}
          >
            <b>{dataApp.name}</b>
          </Card.Grid>
        ))}
      </Card>
    </div>
  )
}

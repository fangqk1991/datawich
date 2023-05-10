import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Card, Divider, Spin } from 'antd'
import { DataAppApis } from '@web/datawich-common/web-api'
import { DataModelModel } from '@fangcha/datawich-service'
import { LS } from '../core/ReactI18n'
import { DataModelCard } from './DataModelCard'

export const DataModelListView: React.FC = () => {
  const [appList, setAppList] = useState<DataModelModel[]>()

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

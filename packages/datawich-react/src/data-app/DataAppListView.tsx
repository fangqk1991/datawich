import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Card, message, Spin } from 'antd'
import { DataAppApis } from '@web/datawich-common/web-api'
import { DataModelModel } from '@fangcha/datawich-service'

export const DataAppListView: React.FC = () => {
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
    <Card>
      {appList.map((dataApp) => (
        <Card.Grid
          style={{
            cursor: 'pointer',
          }}
          key={dataApp.modelKey}
          onClick={() => {
            message.success(dataApp.name)
          }}
        >
          <b>{dataApp.name}</b>
        </Card.Grid>
      ))}
    </Card>
  )
}

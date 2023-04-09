import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Card, Spin } from 'antd'
import { DataAppApis } from '@web/datawich-common/web-api'
import { DataModelModel } from '@fangcha/datawich-service'
import { useNavigate } from 'react-router-dom'
import { ReactI18n } from '../core/ReactI18n'

export const DataAppListView: React.FC = () => {
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
    <>
      <h2>{ReactI18n.t('[i18n] Data Apps')}</h2>
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
    </>
  )
}

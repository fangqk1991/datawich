import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Card, Divider, Spin } from 'antd'
import { DataModelApis } from '@web/datawich-common/web-api'
import { DataModelModel } from '@fangcha/datawich-service'
import { Link, useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { LS } from '../core/ReactI18n'

export const DataAppDetailView: React.FC = () => {
  const { modelKey = '' } = useParams()

  const [version] = useState(0)
  const [dataModel, setDataModel] = useState<DataModelModel>()

  useEffect(() => {
    MyRequest(new CommonAPI(DataModelApis.DataModelInfoGet, modelKey))
      .quickSend()
      .then((response) => {
        setDataModel(response)
      })
  }, [version])

  if (!dataModel) {
    return <Spin size='large' />
  }

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to={{ pathname: `/v1/data-app` }}>{LS('[i18n] Data Apps')}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{dataModel.name}</Breadcrumb.Item>
      </Breadcrumb>
      <Divider style={{ margin: '12px 0' }} />
      <Card>{dataModel.name}</Card>
    </div>
  )
}

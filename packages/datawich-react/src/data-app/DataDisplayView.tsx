import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Card, Spin } from 'antd'
import { DataModelApis } from '@web/datawich-common/web-api'
import { DataModelModel } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'

export const DataDisplayView: React.FC = () => {
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

  return <Card>{dataModel.name}</Card>
}

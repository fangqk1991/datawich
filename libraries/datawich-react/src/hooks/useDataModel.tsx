import React, { useEffect, useState } from 'react'
import { DataModelModel } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { MyRequest } from '@fangcha/auth-react'
import { ApiOptions, CommonAPI } from '@fangcha/app-request'

export const useDataModel = (api: ApiOptions) => {
  const { modelKey = '' } = useParams()
  const [dataModel, setDataModel] = useState<DataModelModel>()

  useEffect(() => {
    MyRequest(new CommonAPI(api, modelKey))
      .quickSend()
      .then((response) => {
        setDataModel(response)
      })
  }, [modelKey])

  return dataModel
}

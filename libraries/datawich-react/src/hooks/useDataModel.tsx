import React, { useEffect, useState } from 'react'
import { DataModelModel } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'

export const useDataModel = () => {
  const { modelKey = '' } = useParams()
  const [dataModel, setDataModel] = useState<DataModelModel>()

  useEffect(() => {
    MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.DataModelInfoGet, modelKey))
      .quickSend()
      .then((response) => {
        setDataModel(response)
      })
  }, [modelKey])

  return dataModel
}

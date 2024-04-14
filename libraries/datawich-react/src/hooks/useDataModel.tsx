import React, { useEffect, useState } from 'react'
import { DataModelModel } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'

export const useDataModel = (modelKey: string, version: number = 0) => {
  const [dataModel, setDataModel] = useState<DataModelModel>()

  useEffect(() => {
    MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.DataModelInfoGet, modelKey))
      .quickSend()
      .then((response) => {
        setDataModel(response)
      })
  }, [modelKey, version])

  return dataModel
}

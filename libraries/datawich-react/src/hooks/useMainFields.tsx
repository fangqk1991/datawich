import React, { useEffect, useState } from 'react'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'

export const useMainFields = () => {
  const { modelKey = '' } = useParams()

  const [mainFields, setMainFields] = useState<ModelFieldModel[]>([])

  useEffect(() => {
    MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.ModelVisibleFieldListGet, modelKey))
      .quickSend()
      .then((response) => {
        setMainFields(response)
      })
  }, [modelKey])

  return mainFields
}

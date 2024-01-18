import React, { useEffect, useState } from 'react'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { MyRequest } from '@fangcha/auth-react'
import { ApiOptions, CommonAPI } from '@fangcha/app-request'

export const useMainFields = (api: ApiOptions) => {
  const { modelKey = '' } = useParams()

  const [mainFields, setMainFields] = useState<ModelFieldModel[]>([])

  useEffect(() => {
    MyRequest(new CommonAPI(api, modelKey))
      .quickSend()
      .then((response) => {
        setMainFields(response)
      })
  }, [modelKey])

  return mainFields
}

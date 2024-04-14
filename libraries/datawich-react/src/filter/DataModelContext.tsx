import React, { useContext, useEffect, useState } from 'react'
import { DataModelModel } from '@fangcha/datawich-service'
import { Spin } from 'antd'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'

interface Context {
  isReady: boolean
  dataModel: DataModelModel
  reloadDataModel: () => void
}

export const DataModelContext = React.createContext<Context>(null as any)

export const useDataModelCtx = (): Context => {
  return useContext(DataModelContext)
}

interface Props extends React.ComponentProps<any> {
  modelKey: string
}

export const DataModelProvider: React.FC<Props> = ({ children, modelKey }: Props) => {
  const [version, setVersion] = useState(0)
  const [isLoading, setLoading] = useState(false)
  const [dataModel, setDataModel] = useState<DataModelModel>()

  useEffect(() => {
    setLoading(true)
    MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.DataModelInfoGet, modelKey))
      .quickSend()
      .then((response) => {
        setDataModel(response)
        setLoading(false)
      })
      .catch(() => {
        setDataModel(undefined)
        setLoading(false)
      })
  }, [modelKey, version])

  const context: Context = {
    isReady: !!dataModel,
    dataModel: dataModel!,
    reloadDataModel: () => setVersion(version + 1),
  }

  return (
    <DataModelContext.Provider value={context}>
      {isLoading || !dataModel ? <Spin size='large' /> : children}
    </DataModelContext.Provider>
  )
}

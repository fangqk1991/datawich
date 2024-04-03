import React, { useContext, useEffect, useMemo, useState } from 'react'
import { DataModelModel, FieldsDisplaySettings, ModelPanelInfo, ProfileEvent } from '@fangcha/datawich-service'
import { useQueryParams } from '@fangcha/react'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { Spin } from 'antd'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'

interface Context {
  panelInfo: ModelPanelInfo | null | undefined
  displaySettings: FieldsDisplaySettings
  reloadPanelInfo: () => void
}

export const ModelPanelContext = React.createContext<Context>(null as any)

export const useModelPanel = (): Context => {
  return useContext(ModelPanelContext)
}

interface Props extends React.ComponentProps<any> {
  dataModel: DataModelModel
}

export const ModelPanelProvider: React.FC<Props> = ({ children, dataModel }: Props) => {
  const [version, setVersion] = useState(0)

  const { queryParams, updateQueryParams } = useQueryParams<{
    keywords: string
    panelId: string
    [p: string]: any
  }>()
  const [panelInfo, setPanelInfo] = useState<ModelPanelInfo | null>()

  const displaySettings = useMemo<FieldsDisplaySettings>(() => {
    if (panelInfo) {
      return panelInfo.configData.displaySettings
    }
    return {
      hiddenFieldsMap: {},
      checkedList: [],
      fixedList: [],
    }
  }, [panelInfo])

  useEffect(() => {
    if (queryParams.panelId === '') {
      setPanelInfo(null)
      return
    }
    if (!queryParams.panelId) {
      const request = MyRequest(
        new CommonAPI(DatawichWebSDKConfig.apis.ProfileInfoGet, ProfileEvent.UserModelDefaultPanel, dataModel.modelKey)
      )
      request.quickSend<{ panelId: string }>().then(({ panelId }) => {
        const usingPanelId = panelId || dataModel.extrasData.defaultPanelId
        if (usingPanelId) {
          updateQueryParams({
            panelId: usingPanelId,
          })
        } else {
          setPanelInfo(null)
        }
      })
      return
    }

    const request = MyRequest(
      new CommonAPI(DatawichWebSDKConfig.apis.ModelPanelInfoGet, dataModel.modelKey, queryParams.panelId)
    )
    request.setMute(true)
    request
      .quickSend<ModelPanelInfo>()
      .then((response) => {
        setPanelInfo(response)
        updateQueryParams({
          ...response.configData.queryParams,
          ...queryParams,
        })
      })
      .catch(() => {
        setPanelInfo(null)
        updateQueryParams({
          panelId: '',
        })
      })
  }, [queryParams.panelId, dataModel, version])

  const context: Context = {
    panelInfo: panelInfo,
    displaySettings: displaySettings,
    reloadPanelInfo: () => setVersion(version + 1),
  }

  return (
    <ModelPanelContext.Provider value={context}>
      {panelInfo === undefined ? <Spin size='large' /> : children}
    </ModelPanelContext.Provider>
  )
}

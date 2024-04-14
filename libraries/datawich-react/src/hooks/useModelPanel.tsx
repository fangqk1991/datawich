import React, { useEffect, useState } from 'react'
import { ModelPanelInfo, ProfileEvent } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'
import { useDataModelCtx } from '../filter/DataModelContext'

export const useModelPanel = (panelId: string, version: number = 0) => {
  const { dataModel } = useDataModelCtx()

  const [isReady, setReady] = useState(false)
  const [panelInfo, setPanelInfo] = useState<ModelPanelInfo | null>(null)

  const reloadPanelInfo = (panelId: string) => {
    const request = MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.ModelPanelInfoGet, dataModel.modelKey, panelId))
    request.setMute(true)
    request
      .quickSend<ModelPanelInfo>()
      .then((response) => {
        setPanelInfo(response)
        setReady(true)
      })
      .catch(() => {
        setPanelInfo(null)
        setReady(true)
      })
  }

  useEffect(() => {
    if (panelId === '') {
      setPanelInfo(null)
      setReady(true)
      return
    }
    setReady(false)
    if (!panelId) {
      const request = MyRequest(
        new CommonAPI(DatawichWebSDKConfig.apis.ProfileInfoGet, ProfileEvent.UserModelDefaultPanel, dataModel.modelKey)
      )
      request.quickSend<{ panelId: string }>().then(({ panelId }) => {
        const usingPanelId = panelId || dataModel.extrasData.defaultPanelId
        if (usingPanelId) {
          reloadPanelInfo(usingPanelId)
        } else {
          setPanelInfo(null)
        }
      })
      return
    }
    reloadPanelInfo(panelId)
  }, [dataModel, panelId, version])

  return {
    isReady: isReady,
    panelInfo: panelInfo,
  }
}

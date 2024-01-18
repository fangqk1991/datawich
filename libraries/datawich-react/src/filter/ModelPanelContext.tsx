import React, { useContext, useEffect, useMemo, useState } from 'react'
import { FieldsDisplaySettings, ModelPanelInfo, ProfileEvent } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { useQueryParams } from '@fangcha/react'
import { MyRequest } from '@fangcha/auth-react'
import { ApiOptions, CommonAPI } from '@fangcha/app-request'
import { Spin } from 'antd'

interface Context {
  panelInfo: ModelPanelInfo | null | undefined
  displaySettings: FieldsDisplaySettings
  reloadPanelInfo: () => void
}

export const ModelPanelContext = React.createContext<Context>(null as any)

export const useModelPanel = (): Context => {
  return useContext(ModelPanelContext)
}

interface Props {
  apis: {
    getProfileInfo: ApiOptions
    getPanelInfo: ApiOptions
  }
}

export const ModelPanelProvider: React.FC<Props> = ({ children, apis }: Props & React.ComponentProps<any>) => {
  const [version, setVersion] = useState(0)

  const { modelKey = '' } = useParams()
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
      const request = MyRequest(new CommonAPI(apis.getProfileInfo, ProfileEvent.UserModelDefaultPanel, modelKey))
      request.quickSend<{ panelId: string }>().then(({ panelId }) => {
        if (panelId) {
          updateQueryParams({
            panelId: panelId,
          })
        } else {
          setPanelInfo(null)
        }
      })
      return
    }
    const request = MyRequest(new CommonAPI(apis.getPanelInfo, modelKey, queryParams.panelId))
    request.quickSend<ModelPanelInfo>().then((response) => {
      setPanelInfo(response)
      updateQueryParams({
        ...response.configData.queryParams,
        ...queryParams,
      })
    })
  }, [queryParams.panelId, version])

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

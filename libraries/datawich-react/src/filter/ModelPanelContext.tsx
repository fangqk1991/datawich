import React, { useContext, useEffect, useMemo } from 'react'
import { DataModelModel, FieldsDisplaySettings, ModelPanelInfo } from '@fangcha/datawich-service'
import { LoadingView, useQueryParams } from '@fangcha/react'
import { useModelPanel } from '../hooks/useModelPanel'

interface Context {
  panelInfo: ModelPanelInfo | null
  displaySettings: FieldsDisplaySettings
}

export const ModelPanelContext = React.createContext<Context>(null as any)

export const useModelPanelCtx = (): Context => {
  return useContext(ModelPanelContext)
}

interface Props extends React.ComponentProps<any> {}

export const ModelPanelProvider: React.FC<Props> = ({ children }: Props) => {
  const { queryParams, updateQueryParams } = useQueryParams<{
    panelId: string
    [p: string]: any
  }>()

  const { isReady, panelInfo } = useModelPanel(queryParams.panelId)

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
    if (isReady) {
      if (panelInfo) {
        updateQueryParams({
          ...panelInfo.configData.queryParams,
          panelId: panelInfo.panelId,
        })
      } else {
        updateQueryParams({
          panelId: '',
        })
      }
    }
  }, [panelInfo])

  const context: Context = {
    panelInfo: panelInfo,
    displaySettings: displaySettings,
  }

  if (!isReady) {
    return <LoadingView />
  }

  return <ModelPanelContext.Provider value={context}>{children}</ModelPanelContext.Provider>
}

import React, { useContext, useEffect, useMemo, useState } from 'react'
import { FieldsDisplaySettings, ModelPanelInfo } from '@fangcha/datawich-service'
import { LoadingView, useQueryParams } from '@fangcha/react'
import { useModelPanel } from './useModelPanel'

interface Context {
  panelInfo: ModelPanelInfo | null
  displaySettings: FieldsDisplaySettings
  reloadPanelInfo: (panelId?: string) => void
}

export const ModelPanelContext = React.createContext<Context>(null as any)

export const useModelPanelCtx = (): Context => {
  return useContext(ModelPanelContext)
}

interface Props extends React.ComponentProps<any> {}

export const ModelPanelProvider: React.FC<Props> = ({ children }: Props) => {
  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams<{
    panelId: string
    [p: string]: any
  }>()

  const [version, setVersion] = useState(0)
  const { isReady, panelInfo } = useModelPanel(queryParams.panelId, version)

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
        // const retainParams = { ...panelInfo.configData.queryParams }
        // const keysMap = Object.keys(queryParams).filter((key) =>
        //   key.match(/^([a-zA-Z_][\w.]+)\.(\$not\.)?(\$\w+)(\.\w+)?$/)
        // )
        // Object.keys(retainParams).forEach((key) => {
        //   if (key in queryParams) {
        //     delete retainParams[key]
        //     ;('.disabled')
        //   }
        // })
        updateQueryParams({
          ...panelInfo.configData.queryParams,
          ...queryParams,
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
    reloadPanelInfo: (panelId?: string) => {
      setQueryParams({
        panelId: panelId || '',
      })
      setVersion(version + 1)
    },
  }

  if (!isReady) {
    return <LoadingView />
  }

  return <ModelPanelContext.Provider value={context}>{children}</ModelPanelContext.Provider>
}

import React, { useContext, useEffect, useState } from 'react'
import { DataModelModel, ProfileEvent, SdkDatawichApis } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { ApiOptions, CommonAPI } from '@fangcha/app-request'

interface Context {
  favorApps: DataModelModel[]
  favorMap: { [modelKey: string]: DataModelModel }
  reloadFavorApps: () => void
  toggleAppFavor: (modelKey: string) => Promise<void>
  checkAppFavor: (modelKey: string) => boolean
}

const FavorAppsContext = React.createContext<Context>(null as any)

export const useFavorAppsCtx = () => {
  return useContext(FavorAppsContext)
}

export const FavorAppsProvider: React.FC<
  React.PropsWithChildren<{
    api_AppListGet?: ApiOptions
    api_ProfileInfoUpdate?: ApiOptions
  }>
> = ({ children, ...props }) => {
  const api_AppListGet = props.api_AppListGet || SdkDatawichApis.ModelListGet
  const api_ProfileInfoUpdate = props.api_ProfileInfoUpdate || SdkDatawichApis.ProfileUserInfoUpdate

  const [favorApps, setFavorApps] = useState<DataModelModel[]>([])
  const favorMap = favorApps.reduce((result, cur) => {
    result[cur.modelKey] = cur
    return result
  }, {})

  const reloadFavorApps = () => {
    const request = MyRequest(api_AppListGet)
    request.quickSend().then((response) => {
      if (Array.isArray(response)) {
        setFavorApps(response)
      }
    })
  }

  const favorAppsCtx: Context = {
    favorApps: favorApps,
    favorMap: favorMap,
    checkAppFavor: (modelKey) => {
      return !!favorMap[modelKey]
    },
    reloadFavorApps: reloadFavorApps,
    toggleAppFavor: async (modelKey: string) => {
      const favorKeys = favorMap[modelKey]
        ? favorApps.filter((app) => app.modelKey !== modelKey).map((app) => app.modelKey)
        : [...favorApps.map((app) => app.modelKey), modelKey]

      const request = MyRequest(new CommonAPI(api_ProfileInfoUpdate, ProfileEvent.UserModelSidebarApps, 'stuff'))
      request.setBodyData({
        favorModelKeys: favorKeys,
      })
      await request.execute()
      reloadFavorApps()
    },
  }
  useEffect(() => {
    favorAppsCtx.reloadFavorApps()
  }, [])

  return <FavorAppsContext.Provider value={favorAppsCtx}>{children}</FavorAppsContext.Provider>
}

import React, { useContext, useEffect, useState } from 'react'
import { CommonProfileApis, DataAppApis } from '@web/datawich-common/admin-apis'
import { DataModelModel } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { ProfileEvent } from '@fangcha/datawich-service'

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

export const FavorAppsProvider = ({ children }: React.ComponentProps<any>) => {
  const [favorApps, setFavorApps] = useState<DataModelModel[]>([])
  const favorMap = favorApps.reduce((result, cur) => {
    result[cur.modelKey] = cur
    return result
  }, {})

  const reloadFavorApps = () => {
    const request = MyRequest(DataAppApis.FavorDataAppListGet)
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

      const request = MyRequest(
        new CommonAPI(CommonProfileApis.ProfileUserInfoUpdate, ProfileEvent.UserModelSidebarApps, 'stuff')
      )
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

import React, { useContext, useEffect, useState } from 'react'
import { DataAppApis } from '@web/datawich-common/web-api'
import { DataModelModel } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'

interface Context {
  favorApps: DataModelModel[]
  reloadFavorApps: () => void
}

const FavorAppsContext = React.createContext<Context>(null as any)

export const useFavorAppsCtx = () => {
  return useContext(FavorAppsContext)
}

export const FavorAppsProvider = ({ children }: React.ComponentProps<any>) => {
  const [favorApps, setFavorApps] = useState<DataModelModel[]>([])

  const favorAppsCtx: Context = {
    favorApps: favorApps,
    reloadFavorApps: () => {
      const request = MyRequest(DataAppApis.FavorDataAppListGet)
      request.quickSend().then((response) => {
        setFavorApps(response)
      })
    },
  }
  useEffect(() => {
    favorAppsCtx.reloadFavorApps()
  }, [])

  return <FavorAppsContext.Provider value={favorAppsCtx}>{children}</FavorAppsContext.Provider>
}

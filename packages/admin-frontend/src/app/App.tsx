import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { MyRouter } from './MyRouter'
import { AuthSdkHelper, useSessionConfig } from '@fangcha/auth-react'
import { OssSDK } from '@fangcha/oss-react'
import './app.scss'
import { DatawichWebSDKConfig } from '@fangcha/datawich-react'
import { CommonProfileApis, DataAppApis, DatawichAdminPages } from '@web/datawich-common/admin-apis'

// ReactTheme.colorPrimary = 'rgb(221 115 164)'
AuthSdkHelper.defaultRedirectUri = '/'

DatawichWebSDKConfig.appPage = (modelKey) =>
  DatawichAdminPages.buildRoute(DatawichAdminPages.DataAppDetailRoute, [modelKey])
DatawichWebSDKConfig.apis.AppListGet = DataAppApis.FavorDataAppListGet
DatawichWebSDKConfig.apis.ProfileInfoUpdate = CommonProfileApis.ProfileUserInfoUpdate

export const App: React.FC = () => {
  const config = useSessionConfig() as any

  OssSDK.init(config.ossParams)

  return <RouterProvider router={MyRouter}></RouterProvider>
}

import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { MyRouter } from './MyRouter'
import { AuthSdkHelper, useSessionConfig } from '@fangcha/auth-react'
import { OssSDK } from '@fangcha/oss-react'
import './app.scss'
import { DatawichWebSDKConfig } from '@fangcha/datawich-react'
import {
  CommonProfileApis,
  DataAppApis,
  DataModelApis,
  DatawichAdminPages,
  ModelFieldApis,
  ModelPanelApis,
} from '@web/datawich-common/admin-apis'

// ReactTheme.colorPrimary = 'rgb(221 115 164)'
AuthSdkHelper.defaultRedirectUri = '/'

DatawichWebSDKConfig.appDetailPage = (modelKey) =>
  DatawichAdminPages.buildRoute(DatawichAdminPages.DataAppDetailRoute, [modelKey])

DatawichWebSDKConfig.apis.AppListGet = DataAppApis.FavorDataAppListGet

DatawichWebSDKConfig.apis.ProfileInfoGet = CommonProfileApis.ProfileInfoGet
DatawichWebSDKConfig.apis.ProfileInfoUpdate = CommonProfileApis.ProfileUserInfoUpdate

DatawichWebSDKConfig.apis.ModelPanelListGet = ModelPanelApis.ModelPanelListGet
DatawichWebSDKConfig.apis.ModelPanelInfoGet = ModelPanelApis.ModelPanelGet
DatawichWebSDKConfig.apis.ModelPanelCreate = ModelPanelApis.ModelPanelCreate
DatawichWebSDKConfig.apis.ModelPanelUpdate = ModelPanelApis.ModelPanelUpdate
DatawichWebSDKConfig.apis.ModelPanelDelete = ModelPanelApis.ModelPanelDelete

DatawichWebSDKConfig.apis.DataModelInfoGet = DataModelApis.DataModelInfoGet
DatawichWebSDKConfig.apis.ModelVisibleFieldListGet = ModelFieldApis.DataModelVisibleFieldListGet

export const App: React.FC = () => {
  const config = useSessionConfig() as any

  OssSDK.init(config.ossParams)

  return <RouterProvider router={MyRouter}></RouterProvider>
}

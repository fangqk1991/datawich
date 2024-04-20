import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { MyRouter } from './MyRouter'
import { AuthSdkHelper } from '@fangcha/auth-react'
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
import { OssApis } from '@fangcha/oss-models'

// ReactTheme.colorPrimary = 'rgb(221 115 164)'
AuthSdkHelper.defaultRedirectUri = '/'

DatawichWebSDKConfig.appDetailPage = (modelKey) =>
  DatawichAdminPages.buildRoute(DatawichAdminPages.DataAppDetailRoute, [modelKey])

DatawichWebSDKConfig.apis.AppListGet = DataAppApis.DataAppListGet
DatawichWebSDKConfig.apis.FavorAppListGet = DataAppApis.FavorDataAppListGet

DatawichWebSDKConfig.apis.ProfileInfoGet = CommonProfileApis.ProfileInfoGet
DatawichWebSDKConfig.apis.ProfileInfoUpdate = CommonProfileApis.ProfileUserInfoUpdate

DatawichWebSDKConfig.apis.ModelPanelListGet = ModelPanelApis.ModelPanelListGet
DatawichWebSDKConfig.apis.ModelPanelInfoGet = ModelPanelApis.ModelPanelInfoGet
DatawichWebSDKConfig.apis.ModelPanelCreate = ModelPanelApis.ModelPanelCreate
DatawichWebSDKConfig.apis.ModelPanelUpdate = ModelPanelApis.ModelPanelUpdate
DatawichWebSDKConfig.apis.ModelPanelDelete = ModelPanelApis.ModelPanelDelete

DatawichWebSDKConfig.apis.DataModelInfoGet = DataModelApis.DataModelInfoGet
DatawichWebSDKConfig.apis.ModelVisibleFieldListGet = ModelFieldApis.DataModelVisibleFieldListGet

DatawichWebSDKConfig.apis.DataAppRecordCreate = DataAppApis.DataAppRecordCreate
DatawichWebSDKConfig.apis.DataAppRecordGet = DataAppApis.DataAppRecordGet
DatawichWebSDKConfig.apis.DataAppRecordUpdate = DataAppApis.DataAppRecordUpdate
DatawichWebSDKConfig.apis.DataAppRecordDelete = DataAppApis.DataAppRecordDelete

DatawichWebSDKConfig.apis.FullModelDataInfoGet = DataAppApis.FullModelDataInfoGet

OssSDK.apis.OssResourcePrepare = OssApis.OssResourcePrepare
OssSDK.apis.OssResourceStatusMark = OssApis.OssResourceStatusMark

export const App: React.FC = () => {
  return <RouterProvider router={MyRouter}></RouterProvider>
}

import React from 'react'
import { ReactApp } from '@fangcha/react'
import { AuthSdkHelper, LaunchContainer } from '@fangcha/auth-react'
import {
  DataAppCoreProvider,
  DatawichWebSDKConfig,
  FavorAppsProvider,
  SDK_DataAppListView,
} from '@fangcha/datawich-react'
import { MainLayout } from './core/MainLayout'
import {
  CommonProfileApis,
  DataAppApis,
  DataModelApis,
  DatawichAdminPages,
  ModelFieldApis,
  ModelPanelApis,
} from '@web/datawich-common/admin-apis'
import { DataAppDetailView } from './data-app/DataAppDetailView'
import { DataModelListView } from './data-model/DataModelListView'
import { DataModelManageView } from './data-model/DataModelManageView'
import { JobListView } from '@fangcha/job-react'
import { OssSDK, ResourceTaskListView } from '@fangcha/oss-react'
import { ModelClientListView } from './model-client/ModelClientListView'
import { DBConnectionListView } from './database/DBConnectionListView'
import { DatabaseDetailView } from './database/DatabaseDetailView'
import { DBTableDetailView } from './database/DBTableDetailView'
import { DBTableDataView } from './database/DBTableDataView'
import { Example_FormPageView } from '@fangcha/form-react/src/example/Example_FormPageView'
import { OssApis } from '@fangcha/oss-models'
import './app/app.scss'

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

new ReactApp({
  mainLayout: (
    <LaunchContainer>
      <FavorAppsProvider>
        <MainLayout appName='Datawich 🍰' />
      </FavorAppsProvider>
    </LaunchContainer>
  ),
  routes: [
    {
      path: '/',
      element: <SDK_DataAppListView />,
    },
    {
      path: DatawichAdminPages.AllDataAppsRoute,
      element: <SDK_DataAppListView />,
    },
    {
      path: DatawichAdminPages.DataAppDetailRoute,
      element: (
        <DataAppCoreProvider>
          <DataAppDetailView />
        </DataAppCoreProvider>
      ),
    },
    {
      path: DatawichAdminPages.ModelListRoute,
      element: <DataModelListView />,
    },
    {
      path: DatawichAdminPages.ModelDetailRoute,
      element: <DataModelManageView />,
    },
    {
      path: DatawichAdminPages.JobListRoute,
      element: <JobListView />,
    },
    {
      path: DatawichAdminPages.ResourceTaskListRoute,
      element: <ResourceTaskListView />,
    },
    {
      path: DatawichAdminPages.ClientListRoute,
      element: <ModelClientListView />,
    },
    {
      path: DatawichAdminPages.DatabaseConnectionListRoute,
      element: <DBConnectionListView />,
    },
    {
      path: DatawichAdminPages.DatabaseDetailRoute,
      element: <DatabaseDetailView />,
    },
    {
      path: DatawichAdminPages.DatabaseTableDetailRoute,
      element: <DBTableDetailView />,
    },
    {
      path: DatawichAdminPages.DatabaseTableDataRoute,
      element: <DBTableDataView />,
    },
    {
      path: '/v0/example/form',
      element: <Example_FormPageView />,
    },
  ],
}).launch()

import { createBrowserRouter } from 'react-router-dom'
import React from 'react'
import { MainLayout } from '../core/MainLayout'
import { RouteErrorBoundary } from '@fangcha/react'
import { DataAppListView, FavorAppsProvider } from '@fangcha/datawich-react'
import { DataAppDetailView } from '../data-app/DataAppDetailView'
import { DataModelListView } from '../data-model/DataModelListView'
import { DataModelManageView } from '../data-model/DataModelManageView'
import { CommonProfileApis, DataAppApis, DatawichAdminPages } from '@web/datawich-common/admin-apis'
import { JobListView } from '@fangcha/job-react'
import { ResourceTaskListView } from '@fangcha/oss-react'
import { ModelClientListView } from '../model-client/ModelClientListView'

export const MyRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <FavorAppsProvider
        api_AppListGet={DataAppApis.FavorDataAppListGet}
        api_ProfileInfoUpdate={CommonProfileApis.ProfileUserInfoUpdate}
      >
        <MainLayout appName='Datawich 🍰' />
      </FavorAppsProvider>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: (
          <DataAppListView
            api_AppListGet={DataAppApis.DataAppListGet}
            appPage={(modelKey) => DatawichAdminPages.buildRoute(DatawichAdminPages.DataAppDetailRoute, [modelKey])}
          />
        ),
      },
      {
        path: DatawichAdminPages.AllDataAppsRoute,
        element: (
          <DataAppListView
            api_AppListGet={DataAppApis.DataAppListGet}
            appPage={(modelKey) => DatawichAdminPages.buildRoute(DatawichAdminPages.DataAppDetailRoute, [modelKey])}
          />
        ),
      },
      {
        path: DatawichAdminPages.DataAppDetailRoute,
        element: <DataAppDetailView />,
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
        path: '*',
        element: <div>404 Not Found</div>,
      },
    ],
  },
])

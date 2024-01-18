import { createBrowserRouter } from 'react-router-dom'
import React from 'react'
import { MainLayout } from '../core/MainLayout'
import { RouteErrorBoundary } from '@fangcha/react'
import { DataAppListView } from '../data-app/DataAppListView'
import { DataAppDetailView } from '../data-app/DataAppDetailView'
import { FavorAppsProvider } from '../core/FavorAppsContext'
import { DataModelListView } from '../data-model/DataModelListView'
import { DataModelManageView } from '../data-model/DataModelManageView'
import { DatawichAdminPages } from '@web/datawich-common/admin-apis'
import { JobListView } from '@fangcha/job-react'
import { ResourceTaskListView } from '@fangcha/oss-react'
import { ModelClientListView } from '../model-client/ModelClientListView'

export const MyRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <FavorAppsProvider>
        <MainLayout appName='Datawich 🍰' />
      </FavorAppsProvider>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: <DataAppListView />,
      },
      {
        path: DatawichAdminPages.AllDataAppsRoute,
        element: <DataAppListView />,
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

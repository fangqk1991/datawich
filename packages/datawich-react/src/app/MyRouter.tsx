import { createBrowserRouter } from 'react-router-dom'
import React from 'react'
import { MainLayout } from '../core/MainLayout'
import { RouteErrorBoundary } from '@fangcha/react'
import { DataAppListView } from '../data-app/DataAppListView'
import { DataAppDetailView } from '../data-app/DataAppDetailView'
import { FavorAppsProvider } from '../core/FavorAppsContext'
import { DataModelListView } from '../data-model/DataModelListView'
import { DataModelManageView } from '../data-model/DataModelManageView'
import { DatawichPages } from '@web/datawich-common/admin-apis'
import { JobListView } from '@fangcha/job-react'
import { ResourceTaskListView } from '@fangcha/oss-react'
import { ModelClientListView } from '../data-model/ModelClientListView'

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
        path: DatawichPages.AllDataAppsRoute,
        element: <DataAppListView />,
      },
      {
        path: DatawichPages.DataAppDetailRoute,
        element: <DataAppDetailView />,
      },
      {
        path: DatawichPages.ModelListRoute,
        element: <DataModelListView />,
      },
      {
        path: DatawichPages.ModelDetailRoute,
        element: <DataModelManageView />,
      },
      {
        path: DatawichPages.JobListRoute,
        element: <JobListView />,
      },
      {
        path: DatawichPages.ResourceTaskListRoute,
        element: <ResourceTaskListView />,
      },
      {
        path: DatawichPages.ClientListRoute,
        element: <ModelClientListView />,
      },
      {
        path: '*',
        element: <div>404 Not Found</div>,
      },
    ],
  },
])

import { createBrowserRouter } from 'react-router-dom'
import React from 'react'
import { MainLayout } from '../core/MainLayout'
import { RouteErrorBoundary } from '@fangcha/react'
import { DataAppListView } from '../data-app/DataAppListView'
import { DataAppDetailView } from '../data-app/DataAppDetailView'
import { FavorAppsProvider } from '../core/FavorAppsContext'
import { DataModelListView } from '../data-model/DataModelListView'
import { DataModelManageView } from '../data-model/DataModelManageView'
import { FormDevView } from '../data-app/FormDevView'
import { AppPages } from '@web/datawich-common/admin-apis'

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
        path: '/v1/all-data-app',
        element: <DataAppListView />,
      },
      {
        path: AppPages.DataAppDetailRoute,
        element: <DataAppDetailView />,
      },
      {
        path: '/v1/data-app-dev/:modelKey',
        element: <FormDevView />,
      },
      {
        path: AppPages.ModelListRoute,
        element: <DataModelListView />,
      },
      {
        path: AppPages.ModelDetailRoute,
        element: <DataModelManageView />,
      },
      {
        path: '*',
        element: <div>404 Not Found</div>,
      },
    ],
  },
])

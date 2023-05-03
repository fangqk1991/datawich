import { createBrowserRouter } from 'react-router-dom'
import React from 'react'
import { MainLayout } from '../core/MainLayout'
import { RouteErrorBoundary } from '@fangcha/react'
import { DataAppListView } from '../data-app/DataAppListView'
import { DataAppDetailView } from '../data-app/DataAppDetailView'
import { FavorAppsProvider } from '../core/FavorAppsContext'
import { DataModelListView } from '../data-model/DataModelListView'

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
        path: '/v1/data-app/:modelKey',
        element: <DataAppDetailView />,
      },
      {
        path: '/v1/data-model',
        element: <DataModelListView />,
      },
      {
        path: '*',
        element: <div>404 Not Found</div>,
      },
    ],
  },
])

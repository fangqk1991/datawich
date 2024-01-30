import { createBrowserRouter } from 'react-router-dom'
import React from 'react'
import { RouteErrorBoundary } from '@fangcha/react'
import { DatawichWebPages } from '@web/datawich-common/web-apis'
import { DatawichAppDetailView } from '../datawich/DatawichAppDetailView'
import { MainLayout } from './MainLayout'
import { DataAppListView, FavorAppsProvider } from '@fangcha/datawich-react'

export const MyRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <FavorAppsProvider>
        <MainLayout />
      </FavorAppsProvider>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: <DataAppListView />,
      },
      {
        path: DatawichWebPages.DatawichAppDetailRoute,
        element: <DatawichAppDetailView />,
      },
      {
        path: '*',
        element: <div>404 Not Found</div>,
      },
    ],
  },
])

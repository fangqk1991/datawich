import { createBrowserRouter } from 'react-router-dom'
import React from 'react'
import { RouteErrorBoundary } from '@fangcha/react'
import { DatawichWebPages } from '@web/datawich-common/web-apis'
import { DatawichAppDetailView } from '../datawich/DatawichAppDetailView'
import { FavorAppsProvider, SDK_DataAppListView, SDK_MainLayout } from '@fangcha/datawich-react'

export const MyRouter = createBrowserRouter([
  {
    path: '/',
    element: (
      <FavorAppsProvider>
        <SDK_MainLayout />
      </FavorAppsProvider>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: <SDK_DataAppListView />,
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

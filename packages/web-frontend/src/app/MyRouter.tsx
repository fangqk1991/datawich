import { createBrowserRouter } from 'react-router-dom'
import React from 'react'
import { RouteErrorBoundary } from '@fangcha/react'
import { FavorAppsProvider, SDK_DataAppDetailView, SDK_DataAppListView, SDK_MainLayout } from '@fangcha/datawich-react'
import { SdkDatawichPages } from '@fangcha/datawich-service'

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
        path: SdkDatawichPages.WebAppDetailRoute,
        element: <SDK_DataAppDetailView />,
      },
      {
        path: '*',
        element: <div>404 Not Found</div>,
      },
    ],
  },
])

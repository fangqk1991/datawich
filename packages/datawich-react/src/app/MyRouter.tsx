import { createBrowserRouter } from 'react-router-dom'
import React from 'react'
import { MainLayout } from '../core/MainLayout'
import { RouteErrorBoundary } from '@fangcha/react'
import { Button } from 'antd'
import { DataAppListView } from '../data-app/DataAppListView'
import { DataAppDetailView } from '../data-app/DataAppDetailView'
import { FavorAppsProvider } from '../core/FavorAppsContext'

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
        path: '/v1/data-app',
        element: <DataAppListView />,
      },
      {
        path: '/v1/data-app/:modelKey',
        element: <DataAppDetailView />,
      },
      {
        path: '/v1/page-1',
        children: [
          {
            path: '/v1/page-1/sub-page-1',
            element: (
              <div>
                <h3>sub page 1 main</h3>
                <Button type='primary'>Button</Button>
              </div>
            ),
          },
          {
            path: '/v1/page-1/sub-page-2',
            element: <div>sub page 2 main</div>,
          },
        ],
      },
      {
        path: '*',
        element: <div>404 Not Found</div>,
      },
    ],
  },
])

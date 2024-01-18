import { createBrowserRouter } from 'react-router-dom'
import React from 'react'
import { RouteErrorBoundary } from '@fangcha/react'
import { DatawichWebPages } from '@web/datawich-common/web-apis'
import { DatawichAppView } from '../datawich/DatawichAppView'
import { MainLayout } from './MainLayout'

export const MyRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: <div>Home</div>,
      },
      {
        path: DatawichWebPages.DatawichAppRoute,
        element: <DatawichAppView />,
      },
      {
        path: '*',
        element: <div>404 Not Found</div>,
      },
    ],
  },
])

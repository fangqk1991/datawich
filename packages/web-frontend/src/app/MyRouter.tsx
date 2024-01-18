import { createBrowserRouter, Outlet } from 'react-router-dom'
import React from 'react'
import { RouteErrorBoundary } from '@fangcha/react'
import { DatawichWebPages } from '@web/datawich-common/web-apis'
import { DatawichAppView } from '../datawich/DatawichAppView'

export const MyRouter = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
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

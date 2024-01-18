import { createBrowserRouter, Outlet } from 'react-router-dom'
import React from 'react'
import { RouteErrorBoundary } from '@fangcha/react'

export const MyRouter = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/',
        element: '!!!!',
      },
      {
        path: '*',
        element: <div>404 Not Found</div>,
      },
    ],
  },
])

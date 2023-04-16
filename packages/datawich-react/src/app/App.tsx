import React from 'react'
import { ErrorBoundary } from '@ant-design/pro-components'
import { RouterProvider } from 'react-router-dom'
import { MyRouter } from './MyRouter'
import { ReactDialogTheme } from '@fangcha/react'
import { VisitorProvider } from '@fangcha/auth-react'

ReactDialogTheme.colorPrimary = 'rgb(221 115 164)'

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <VisitorProvider>
        <RouterProvider router={MyRouter}></RouterProvider>
      </VisitorProvider>
    </ErrorBoundary>
  )
}

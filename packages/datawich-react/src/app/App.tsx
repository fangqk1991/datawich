import React from 'react'
import { ErrorBoundary } from '@ant-design/pro-components'
import { RouterProvider } from 'react-router-dom'
import { MyRouter } from './MyRouter'
import { ReactTheme } from '@fangcha/react'
import { SessionContext, useSession, useSessionConfig, VisitorProvider } from '@fangcha/auth-react'
import './app.scss'
import './bootstrap-like.scss'
import { OssFrontendService } from '../core/OssFrontendService'

ReactTheme.colorPrimary = 'rgb(221 115 164)'

export const App: React.FC = () => {
  const sessionCtx = useSession()
  const config = useSessionConfig() as any

  OssFrontendService.init(config.ossParams)

  return (
    <ErrorBoundary>
      <SessionContext.Provider value={sessionCtx}>
        <VisitorProvider>
          <RouterProvider router={MyRouter}></RouterProvider>
        </VisitorProvider>
      </SessionContext.Provider>
    </ErrorBoundary>
  )
}

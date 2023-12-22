import React from 'react'
import { ErrorBoundary } from '@ant-design/pro-components'
import { RouterProvider } from 'react-router-dom'
import { MyRouter } from './MyRouter'
import { ReactTheme } from '@fangcha/react'
import { AuthSdkHelper, useSessionConfig } from '@fangcha/auth-react'
import { OssSDK } from '@fangcha/oss-react'
import './app.scss'
import './bootstrap-like.scss'

ReactTheme.colorPrimary = 'rgb(221 115 164)'
AuthSdkHelper.defaultRedirectUri = '/'

export const App: React.FC = () => {
  const config = useSessionConfig() as any

  OssSDK.init(config.ossParams)

  return (
    <ErrorBoundary>
      <RouterProvider router={MyRouter}></RouterProvider>
    </ErrorBoundary>
  )
}

import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { MyRouter } from './MyRouter'
import { AuthSdkHelper, useSessionConfig } from '@fangcha/auth-react'
import { OssSDK } from '@fangcha/oss-react'
import './app.scss'

// ReactTheme.colorPrimary = 'rgb(221 115 164)'
AuthSdkHelper.defaultRedirectUri = '/'

export const App: React.FC = () => {
  const config = useSessionConfig() as any

  OssSDK.init(config.ossParams)

  return <RouterProvider router={MyRouter}></RouterProvider>
}

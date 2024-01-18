import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { MyRouter } from './MyRouter'
import { AuthSdkHelper } from '@fangcha/auth-react'
import './app.scss'

// ReactTheme.colorPrimary = 'rgb(221 115 164)'
AuthSdkHelper.defaultRedirectUri = '/'

export const App: React.FC = () => {
  return <RouterProvider router={MyRouter}></RouterProvider>
}

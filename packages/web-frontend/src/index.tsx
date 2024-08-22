import React from 'react'
import { AuthSdkHelper, LaunchContainer } from '@fangcha/auth-react'
import './app/app.scss'
import { ReactApp } from '@fangcha/react'
import {
  SDK_DataAppDetailView,
  SDK_DataAppListView,
  SDK_DataAppRecordView,
  SDK_MainLayout,
} from '@fangcha/datawich-react'
import { SdkDatawichPages } from '@fangcha/datawich-service'

AuthSdkHelper.defaultRedirectUri = '/'

new ReactApp({
  mainLayout: (
    <LaunchContainer allowAnonymous={true}>
      <SDK_MainLayout />
    </LaunchContainer>
  ),
  routes: [
    {
      path: '/',
      element: <SDK_DataAppListView />,
    },
    {
      path: SdkDatawichPages.WebAppDetailRoute,
      element: (
        <SDK_DataAppDetailView
          extrasColumns={
            [
              // {
              //   title: 'test',
              //   fixed: 'right',
              //   render: () => <b>!!!</b>,
              // },
            ]
          }
        />
      ),
    },
    {
      path: SdkDatawichPages.WebAppRecordRoute,
      element: <SDK_DataAppRecordView />,
    },
  ],
}).launch()

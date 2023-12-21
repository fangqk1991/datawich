import { AppstoreOutlined, DesktopOutlined, UserOutlined } from '@ant-design/icons'
import { Route } from '@ant-design/pro-layout/es/typing'
import { LS } from '../core/ReactI18n'
import { useFavorAppsCtx } from '../core/FavorAppsContext'
import { DatawichPages } from '@web/datawich-common/admin-apis'
import React from 'react'

export const useMenu = () => {
  const favorAppsCtx = useFavorAppsCtx()

  const myMenu: Route = {
    path: '/',
    children: [
      {
        key: 'M_DataApps',
        name: LS('[i18n] Data Apps'),
        icon: <DesktopOutlined />,
        children: [
          {
            path: DatawichPages.AllDataAppsRoute,
            name: LS('[i18n] All Apps'),
          },
          ...favorAppsCtx.favorApps.map((item) => ({
            path: DatawichPages.buildRoute(DatawichPages.DataAppDetailRoute, [item.modelKey]),
            name: item.name,
          })),
        ],
      },
      {
        key: 'M_DataModels',
        name: LS('[i18n] Management Center'),
        icon: <AppstoreOutlined />,
        children: [
          {
            path: DatawichPages.ModelListRoute,
            name: LS('[i18n] Data Model'),
          },
          {
            path: DatawichPages.ClientListRoute,
            name: LS('[i18n] API Clients'),
          },
          // ...(visitorCtx.userInfo.isAdmin
          //   ? [
          //       {
          //         path: DatawichPages.JobListRoute,
          //         name: LS('[i18n] Task List'),
          //       },
          //     ]
          //   : []),
        ],
      },
      {
        key: 'M_UserCenter',
        name: '个人中心',
        icon: <UserOutlined />,
        children: [
          {
            path: DatawichPages.ResourceTaskListRoute,
            name: '我的下载',
          },
        ],
      },
    ],
  }
  return myMenu
}

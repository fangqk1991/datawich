import { AppstoreOutlined, DesktopOutlined, UserOutlined } from '@ant-design/icons'
import { Route } from '@ant-design/pro-layout/es/typing'
import { LS } from '../core/ReactI18n'
import { DatawichAdminPages } from '@web/datawich-common/admin-apis'
import React from 'react'
import { useFavorAppsCtx } from '@fangcha/datawich-react'
import { useUserInfo } from '@fangcha/auth-react'

export const useMenu = () => {
  const favorAppsCtx = useFavorAppsCtx()
  const userInfo = useUserInfo()

  const myMenu: Route = {
    path: '/',
    children: [
      {
        key: 'M_DataApps',
        name: LS('[i18n] Data Apps'),
        icon: <DesktopOutlined />,
        children: [
          {
            path: DatawichAdminPages.AllDataAppsRoute,
            name: LS('[i18n] All Apps'),
          },
          ...favorAppsCtx.favorApps.map((item) => ({
            path: DatawichAdminPages.buildRoute(DatawichAdminPages.DataAppDetailRoute, [item.modelKey]),
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
            path: DatawichAdminPages.ModelListRoute,
            name: LS('[i18n] Data Model'),
          },
          {
            path: DatawichAdminPages.ClientListRoute,
            name: LS('[i18n] API Clients'),
          },
          {
            path: DatawichAdminPages.DatabaseConnectionListRoute,
            name: 'Databases',
          },
          // ...(userInfo.isAdmin
          //   ? [
          //       {
          //         path: DatawichAdminPages.DatabaseTableListRoute,
          //         name: 'Databases',
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
            path: DatawichAdminPages.ResourceTaskListRoute,
            name: '我的下载',
          },
        ],
      },
    ],
  }
  return myMenu
}

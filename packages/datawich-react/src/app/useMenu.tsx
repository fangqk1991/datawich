import { AppstoreOutlined, DesktopOutlined, UserOutlined } from '@ant-design/icons'
import { Route } from '@ant-design/pro-layout/es/typing'
import { LS } from '../core/ReactI18n'
import { useFavorAppsCtx } from '../core/FavorAppsContext'
import { DatawichPages } from '@web/datawich-common/admin-apis'

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
        ],
      },
      {
        key: 'M_UserCenter',
        path: '/v1/page-2',
        name: '个人中心',
        icon: <UserOutlined />,
        children: [
          {
            path: '/v1/download',
            name: '我的下载',
          },
        ],
      },
    ],
  }
  return myMenu
}

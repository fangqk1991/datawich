import { AppstoreOutlined, DesktopOutlined, UserOutlined } from '@ant-design/icons'
import { Route } from '@ant-design/pro-layout/es/typing'
import { LS } from '../core/ReactI18n'
import { useFavorAppsCtx } from '../core/FavorAppsContext'

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
            path: '/v1/data-app',
            name: LS('[i18n] All Apps'),
          },
          ...favorAppsCtx.favorApps.map((item) => ({
            path: `/v1/data-app/${item.modelKey}`,
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
            path: '/v1/data-model',
            name: LS('[i18n] Data Model'),
          },
          {
            path: '/v1/model-client',
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

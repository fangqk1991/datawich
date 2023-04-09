import { AppstoreOutlined, DesktopOutlined, UserOutlined } from '@ant-design/icons'
import { Route } from '@ant-design/pro-layout/es/typing'
import { ReactI18n } from '../core/ReactI18n'

export const useMenu = () => {
  // const visitorCtx = useVisitorCtx()

  const myMenu: Route = {
    path: '/',
    children: [
      {
        key: 'M_DataApps',
        name: ReactI18n.t('[i18n] Data Apps'),
        icon: <DesktopOutlined />,
        children: [
          {
            path: '/v1/data-app',
            name: ReactI18n.t('[i18n] All Apps'),
          },
        ],
      },
      {
        key: 'M_DataModels',
        name: ReactI18n.t('[i18n] Management Center'),
        icon: <AppstoreOutlined />,
        children: [
          {
            path: '/v1/data-model',
            name: ReactI18n.t('[i18n] Data Model'),
          },
          {
            path: '/v1/model-client',
            name: ReactI18n.t('[i18n] API Clients'),
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

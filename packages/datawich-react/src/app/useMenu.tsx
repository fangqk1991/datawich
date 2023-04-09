import { AppstoreOutlined, DesktopOutlined, UserOutlined } from '@ant-design/icons'
import { Route } from '@ant-design/pro-layout/es/typing'

export const useMenu = () => {
  // const visitorCtx = useVisitorCtx()

  const myMenu: Route = {
    path: '/',
    children: [
      {
        key: 'M_DataApps',
        name: '数据应用',
        path: '/v1/page-1',
        icon: <DesktopOutlined />,
        children: [
          {
            path: '/v1/data-app',
            name: '所有应用',
          },
        ],
      },
      {
        key: 'M_DataModels',
        path: '/v1/page-2',
        name: '模型管理',
        icon: <AppstoreOutlined />,
        children: [
          {
            path: '/v1/data-model',
            name: '模型管理',
          },
          {
            path: '/v1/model-client',
            name: 'API 应用管理',
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

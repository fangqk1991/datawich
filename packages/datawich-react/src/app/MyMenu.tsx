import { DatabaseOutlined, DesktopOutlined, UserOutlined } from '@ant-design/icons'
import { Route } from '@ant-design/pro-layout/es/typing'

export const MyMenu: Route = {
  path: '/',
  children: [
    {
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
      path: '/v1/page-2',
      name: '模型管理',
      icon: <DatabaseOutlined />,
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

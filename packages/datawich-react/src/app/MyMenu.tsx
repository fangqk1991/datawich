import { ChromeFilled, CrownFilled } from '@ant-design/icons'
import { Route } from '@ant-design/pro-layout/es/typing'

export const MyMenu: Route = {
  path: '/',
  children: [
    {
      name: 'Page - 1',
      path: '/v1/page-1',
      icon: <CrownFilled />,
      children: [
        {
          path: '/v1/page-1/sub-page-1',
          name: 'SubPage - 1',
          icon: <CrownFilled />,
        },
        {
          path: '/v1/page-1/sub-page-2',
          name: 'SubPage - 2',
          icon: <ChromeFilled />,
        },
      ],
    },
    {
      path: '/v1/page-2',
      name: 'Page - 2',
      icon: <CrownFilled />,
    },
  ],
}

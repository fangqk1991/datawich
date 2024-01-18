import { UserOutlined } from '@ant-design/icons'
import { ProLayout } from '@ant-design/pro-layout'
import React from 'react'
import { Dropdown } from 'antd'
import { useSessionConfig, useUserInfo } from '@fangcha/auth-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { WebAuthApis } from '@fangcha/sso-models'
import { RouterLink } from '@fangcha/react'

interface Props {
  appName?: string
}

export const MainLayout: React.FC<Props> = ({ appName }) => {
  const config = useSessionConfig()
  const userInfo = useUserInfo(true)

  const location = useLocation()
  const navigate = useNavigate()

  return (
    <ProLayout
      token={{
        pageContainer: {
          paddingInlinePageContainerContent: 20,
          paddingBlockPageContainerContent: 20,
        },
      }}
      logo={null}
      title={config.appName || appName || 'App'}
      layout='top'
      splitMenus={false}
      defaultCollapsed={false}
      location={{
        pathname: location.pathname,
      }}
      onMenuHeaderClick={() => navigate('/')}
      menu={{
        type: 'sub',
        defaultOpenAll: true,
        ignoreFlatMenu: true,
      }}
      avatarProps={{
        icon: <UserOutlined />,
        render: (avatarProps, avatar) => {
          if (!userInfo) {
            return (
              <>
                未登录，<a href={WebAuthApis.RedirectLogin.route}>点击登录</a>
              </>
            )
          }
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    label: 'Logout',
                    onClick: () => {
                      window.location.href = WebAuthApis.RedirectLogout.route
                    },
                  },
                ],
              }}
              trigger={['click']}
            >
              <div>
                {avatar}
                <span
                  style={{
                    marginInlineStart: 8,
                    userSelect: 'none',
                  }}
                >
                  {userInfo.email}
                </span>

                {/*<Space>*/}
                {/*  Click me*/}
                {/*  <DownOutlined />*/}
                {/*</Space>*/}
              </div>
            </Dropdown>

            // <div
            //   onClick={() => {
            //     console.info('onclick')
            //   }}
            // >
            // </div>
          )
        },
      }}
      // actionsRender 必须定义，否则会影响 avatarProps 的生效
      actionsRender={() => {
        return []
      }}
      menuItemRender={(item, dom) => <RouterLink route={item.path || '/'}>{dom}</RouterLink>}
    >
      <Outlet />
    </ProLayout>
  )
}

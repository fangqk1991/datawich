import { UserOutlined } from '@ant-design/icons'
import { ProLayout } from '@ant-design/pro-layout'
import React from 'react'
import { ConfigProvider, Dropdown } from 'antd'
import { useVisitorCtx } from '@fangcha/auth-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { WebAuthApis } from '@fangcha/sso-models'
import { useMenu } from '../app/useMenu'
import { RouterLink } from '@fangcha/react'

interface Props {
  appName: string
}

export const MainLayout: React.FC<Props> = ({ appName }) => {
  const visitorCtx = useVisitorCtx()
  const menu = useMenu()

  const { userInfo } = visitorCtx

  const location = useLocation()
  const navigate = useNavigate()

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'rgb(221 115 164)',
        },
      }}
    >
      <ProLayout
        token={{
          pageContainer: {
            paddingInlinePageContainerContent: 20,
            paddingBlockPageContainerContent: 20,
          },
        }}
        logo={null}
        title={appName}
        fixSiderbar={true}
        layout='mix'
        splitMenus={false}
        defaultCollapsed={false}
        route={menu}
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
    </ConfigProvider>
  )
}

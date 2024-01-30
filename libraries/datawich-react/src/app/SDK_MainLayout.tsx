import { UserOutlined } from '@ant-design/icons'
import { DefaultFooter, ProLayout } from '@ant-design/pro-layout'
import React from 'react'
import { Dropdown } from 'antd'
import { useSessionConfig, useUserInfo } from '@fangcha/auth-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { WebAuthApis } from '@fangcha/sso-models'
import { RouterLink } from '@fangcha/react'
import { useFavorAppsCtx } from '../profile/FavorAppsContext'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'

interface Props {
  appName?: string
}

export const SDK_MainLayout: React.FC<Props> = ({ appName }) => {
  const config = useSessionConfig()
  const userInfo = useUserInfo(true)

  const location = useLocation()
  const navigate = useNavigate()
  const favorAppsCtx = useFavorAppsCtx()

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
      fixedHeader={true}
      defaultCollapsed={false}
      location={{
        pathname: location.pathname,
      }}
      onMenuHeaderClick={() => navigate('/')}
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
                    key: 'email',
                    label: userInfo.email,
                  },
                  {
                    key: 'logout',
                    label: '登出',
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
                  {(userInfo.email || '').split('@')[0]}
                </span>
              </div>
            </Dropdown>
          )
        },
      }}
      // actionsRender 必须定义，否则会影响 avatarProps 的生效
      actionsRender={() => {
        return userInfo
          ? [
              <Dropdown
                menu={{
                  items: favorAppsCtx.favorApps.map((item) => ({
                    key: item.modelKey,
                    label: item.name,
                    onClick: () => {
                      navigate(DatawichWebSDKConfig.appDetailPage(item.modelKey))
                    },
                  })),
                }}
                trigger={['click']}
              >
                <b>收藏夹 ⭐️</b>
              </Dropdown>,
            ]
          : []
      }}
      menuItemRender={(item, dom) => <RouterLink route={item.path || '/'}>{dom}</RouterLink>}
    >
      <Outlet />
      <DefaultFooter
        copyright={false}
        links={[
          {
            key: 'Datawich',
            title: 'Powered by fangqk1991/datawich',
            href: 'https://github.com/fangqk1991/datawich',
            blankTarget: true,
          },
        ]}
      />
    </ProLayout>
  )
}

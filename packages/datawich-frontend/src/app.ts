import { OssFrontendService, OssRouteData } from '@fangcha/vue/oss-service'
import DataDisplayView from './views/DataDisplayView'
import { LogicExpressionView } from './components/LogicExpressionView'
import { GeneralDataManager } from '@fangcha/datawich-frontend'
import { AdminApp } from '@fangcha/vue/app-admin'
import { KitSsoApis } from '@fangcha/backend-kit/lib/apis'
import { SessionHTTP } from '@fangcha/vue/basic'
import { I18nCode, VisitorInfo } from '@fangcha/tools'
import { MySession } from './MySession'
import { DataAppListView } from './core/data-app/DataAppListView'
import { DataModelListView } from './core/data-model/DataModelListView'
import { DataModelManageView } from './core/data-model/DataModelManageView'
import { UserGroupListView } from './core/user/UserGroupListView'
import { ModelClientListView } from './core/model-client/ModelClientListView'

const _fcApp = new AdminApp({
  appName: 'Datawich 🍰',
  plugins: [OssFrontendService],
  style: {
    appHeader: {
      background: '#DD73A4',
    },
  },

  session: MySession,
  loginUrl: KitSsoApis.Login.route,
  logoutUrl: KitSsoApis.Logout.route,

  reloadUserInfo: async (): Promise<VisitorInfo> => {
    const visitorInfo = await SessionHTTP.getUserInfo()
    return {
      iamId: 0,
      email: visitorInfo.email,
      name: visitorInfo.email,
      permissionKeyMap: {},
      // isAdmin: true,
      locale: I18nCode.en,
    }
  },

  homeView: DataAppListView,
  appDidLoad: async () => {
    OssFrontendService.init({
      defaultBucketName: MySession.config.ossParams.defaultBucketName,
      defaultOssZone: MySession.config.ossParams.defaultOssZone,
    })
    GeneralDataManager.useAttachmentFieldPlugin({
      bucketName: MySession.config.ossParams.defaultBucketName,
      ossZone: MySession.config.ossParams.defaultOssZone,
    })
  },
  sidebarNodes: [
    {
      uid: 'data-apps',
      titleEn: '数据应用',
      titleZh: '数据应用',
      icon: 'el-icon-data-analysis',
      links: [
        {
          titleEn: '所有应用',
          titleZh: '所有应用',
          path: '/v1/data-app',
        },
      ],
    },
    {
      titleEn: '模型管理',
      titleZh: '模型管理',
      icon: 'el-icon-lock',
      links: [
        {
          titleEn: '模型管理',
          titleZh: '模型管理',
          path: '/v1/data-model',
        },
        // {
        //   titleEn: '用户组管理',
        //   titleZh: '用户组管理',
        //   path: '/v1/user-group',
        // },
        {
          titleEn: 'API 应用管理',
          titleZh: 'API 应用管理',
          path: '/v1/model-client',
        },
      ],
    },
    {
      titleEn: 'User Center',
      titleZh: '个人中心',
      icon: 'el-icon-user',
      links: [
        {
          titleEn: 'My Downloads',
          titleZh: '我的下载',
          path: OssRouteData.ResourceTaskListView.path,
        },
      ],
    },
  ],
  routes: [
    {
      path: '/v1/data-app',
      component: DataAppListView,
      name: 'DataAppListView',
    },
    {
      path: '/v1/data-app/:modelKey',
      component: DataDisplayView,
      name: 'DataDisplayView',
      props: true,
    },
    {
      path: '/v1/data-model',
      component: DataModelListView,
      name: 'DataModelListView',
    },
    {
      path: '/v1/data-model/:modelKey',
      component: DataModelManageView,
      name: 'DataModelManageView',
    },
    {
      path: '/v1/user-group',
      component: UserGroupListView,
      name: 'UserGroupListView',
    },
    {
      path: '/v1/model-client',
      component: ModelClientListView,
      name: 'ModelClientListView',
    },
    {
      path: '/v0/component/logic-expression',
      component: LogicExpressionView,
      name: 'LogicExpressionView',
    },
  ],
})
window._fcApp = _fcApp
window._datawichApp = _fcApp
_fcApp.launch()

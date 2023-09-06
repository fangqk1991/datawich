import { OssFrontendService, OssRouteData } from '@fangcha/vue/oss-service'
import { DataDisplayView } from './views/data-app/DataDisplayView'
import { LogicExpressionView } from './components/LogicExpressionView'
import { Page404 } from '@fangcha/vue/app'
import { AdminApp } from '@fangcha/admin-vue'
import { SessionHTTP } from '@fangcha/vue/basic'
import { I18nCode, VisitorInfo } from '@fangcha/tools'
import { MySession } from './services/MySession'
import { DataAppListView } from './views/data-app/DataAppListView'
import { DataModelListView } from './views/data-model/DataModelListView'
import { DataModelManageView } from './views/data-model/DataModelManageView'
import { UserGroupListView } from './views/user/UserGroupListView'
import { ModelClientListView } from './views/model-client/ModelClientListView'
import { GeneralDataManager } from './services/GeneralDataManager'
import { DatawichI18N } from '@web/datawich-common/i18n'
import { MyFavorSidebar } from './views/data-app/MyFavorSidebar'
import { WebAuthApis } from '@fangcha/sso-models'
import { AppPages } from '@web/datawich-common/admin-apis'

const _fcApp = new AdminApp({
  appName: 'Datawich 🍰',
  plugins: [OssFrontendService],
  style: {
    appHeader: {
      background: '#DD73A4',
    },
  },
  refreshIfVersionChanged: true,

  i18nMap: DatawichI18N,

  session: MySession,
  loginUrl: WebAuthApis.RedirectLogin.route,
  logoutUrl: WebAuthApis.RedirectLogout.route,

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

  appWillLoad: () => {
    MyFavorSidebar.reloadFavorApps()
    GeneralDataManager.loadVueFilters()
  },
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
      titleEn: 'Data Apps',
      titleZh: '数据应用',
      icon: 'el-icon-data-analysis',
      links: [
        {
          titleEn: 'All Apps',
          titleZh: '所有应用',
          path: AppPages.DataAppListRoute,
        },
      ],
    },
    {
      titleEn: 'Data Model',
      titleZh: '模型管理',
      icon: 'el-icon-lock',
      links: [
        {
          titleEn: 'Models',
          titleZh: '模型管理',
          path: AppPages.ModelListRoute,
        },
        // {
        //   titleEn: '用户组管理',
        //   titleZh: '用户组管理',
        //   path: '/v1/user-group',
        // },
        {
          titleEn: 'API Clients',
          titleZh: 'API 应用管理',
          path: AppPages.ClientListRoute,
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
      path: AppPages.DataAppListRoute,
      component: DataAppListView,
      name: 'DataAppListView',
    },
    {
      path: AppPages.DataAppDetailRoute,
      component: DataDisplayView,
      name: 'DataDisplayView',
      props: true,
    },
    {
      path: AppPages.ModelListRoute,
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
      path: AppPages.ClientListRoute,
      component: ModelClientListView,
      name: 'ModelClientListView',
    },
    {
      path: '/v0/component/logic-expression',
      component: LogicExpressionView,
      name: 'LogicExpressionView',
    },
    {
      path: '*',
      component: Page404,
    },
  ],
})
window._fcApp = _fcApp
window._datawichApp = _fcApp
_fcApp.launch()

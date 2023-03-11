import { DatawichConfig } from '../DatawichConfig'
import { GlobalAppConfig } from 'fc-config'
import { WebApp } from '@fangcha/backend-kit/lib/router'
import { DatawichOssPlugin } from '../services/DatawichOssPlugin'
import { MyDatabase } from '../services/MyDatabase'
import { AliyunOSS } from '@fangcha/ali-oss'
import { DatawichDataAppSpecs } from './admin/specs/DatawichDataAppSpecs'
import { _FangchaState } from '@fangcha/backend-kit'
import { DatawichSwaggerDocItems } from './admin/specs'
import { _DatawichService } from '../services/_DatawichService'
import { _SessionApp } from '@fangcha/router/lib/session'
import { loggerForDev } from '@fangcha/logger'
import { SsoSdkPlugin } from '@fangcha/web-auth-sdk'

_SessionApp.setPermissionProtocol({
  checkUserIsAdmin: (email) => {
    return email === GlobalAppConfig.Datawich.superAdminEmail
  },
  checkUserHasPermission: (email, permissionKey) => {
    loggerForDev.debug(`checkUserHasPermission: `, email, permissionKey)
    return email === GlobalAppConfig.Datawich.superAdminEmail
  },
  checkUserInAnyGroup: (email, ...groupIds) => {
    loggerForDev.debug(`checkUserInAnyGroup: `, email, groupIds)
    return false
  },
})

const app = new WebApp({
  env: GlobalAppConfig.Env,
  tags: GlobalAppConfig.Tags,
  appName: 'datawich-admin',
  wecomBotKey: DatawichConfig.wecomBotKey,
  mainDocItems: [
    ...DatawichSwaggerDocItems,
    {
      name: 'Data App Extras',
      pageURL: '/api-docs/v1/data-app-extras',
      specs: DatawichDataAppSpecs,
    },
  ],
  routerOptions: {
    baseURL: DatawichConfig.adminBaseURL,
    backendPort: DatawichConfig.adminPort,
    jwtProtocol: {
      jwtKey: 'datawich_token_jwt',
      jwtSecret: DatawichConfig.adminJwtSecret,
    },
  },
  plugins: [
    SsoSdkPlugin({
      ssoAuth: DatawichConfig.adminSSO,
      jwtOptions: {
        jwtKey: 'datawich_token_jwt',
        jwtSecret: DatawichConfig.adminJwtSecret,
      },
    }),
    DatawichOssPlugin,
  ],
  appDidLoad: async () => {
    _FangchaState.frontendConfig = DatawichConfig.frontendConfig

    _DatawichService.init({
      database: MyDatabase.datawichDB,
      ossForSignature: new AliyunOSS(DatawichConfig.ossOptions.Default.visitor),
      // downloadRootDir: DatawichConfig.datawichDownloadDir,
    })
  },

  checkHealth: async () => {},
})
app.launch()

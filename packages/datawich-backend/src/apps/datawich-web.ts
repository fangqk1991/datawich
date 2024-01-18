import { DatawichConfig } from '../DatawichConfig'
import { GlobalAppConfig } from 'fc-config'
import { WebApp } from '@fangcha/backend-kit/lib/router'
import { DatawichDataAppSpecs } from './admin/specs/DatawichDataAppSpecs'
import { _FangchaState } from '@fangcha/backend-kit'
import { DatawichSwaggerDocItems } from './admin/specs'
import { SsoSdkPlugin } from '@fangcha/web-auth-sdk'
import { DatawichSdkPlugin } from '@fangcha/datawich-service/src/sdk-plugin'

const app = new WebApp({
  env: GlobalAppConfig.Env,
  tags: GlobalAppConfig.Tags,
  appName: 'datawich-web',
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
    baseURL: DatawichConfig.webBaseURL,
    backendPort: DatawichConfig.webPort,
    jwtProtocol: {
      jwtKey: 'datawich_web_jwt',
      jwtSecret: DatawichConfig.webJwtSecret,
    },
  },
  plugins: [
    SsoSdkPlugin({
      ssoAuth: DatawichConfig.webSSO,
      jwtOptions: {
        jwtKey: 'datawich_web_jwt',
        jwtSecret: DatawichConfig.webJwtSecret,
      },
    }),
    DatawichSdkPlugin({
      authConfig: DatawichConfig.datawichSDK,
    }),
  ],
  appDidLoad: async () => {
    _FangchaState.frontendConfig = DatawichConfig.frontendConfig
  },

  checkHealth: async () => {},
})
app.launch()

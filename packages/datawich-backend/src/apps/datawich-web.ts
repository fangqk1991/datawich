import { DatawichConfig } from '../DatawichConfig'
import { GlobalAppConfig } from 'fc-config'
import { WebApp } from '@fangcha/backend-kit/lib/router'
import { _FangchaState } from '@fangcha/backend-kit'
import { SsoSdkPlugin } from '@fangcha/web-auth-sdk'
import { DatawichSdkPlugin } from '@fangcha/datawich-service/lib/sdk-plugin'

const app = new WebApp({
  env: GlobalAppConfig.Env,
  tags: GlobalAppConfig.Tags,
  appName: 'datawich-web',
  wecomBotKey: DatawichConfig.wecomBotKey,
  mainDocItems: [],
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

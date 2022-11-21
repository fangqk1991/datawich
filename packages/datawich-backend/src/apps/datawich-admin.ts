import { DatawichConfig } from '../DatawichConfig'
import { GlobalAppConfig } from 'fc-config'
import { TypicalSsoSdkPlugin } from '@fangcha/backend-kit/lib/sso'
import { WebApp } from '@fangcha/backend-kit/lib/router'
import { DatawichSwaggerDocItems } from '@fangcha/datawich-service/lib/specs'
import { DatawichOssPlugin } from '../services/DatawichOssPlugin'
import { _DatawichService } from '@fangcha/datawich-service'
import { MyDatabase } from '../services/MyDatabase'
import { AliyunOSS } from '@fangcha/ali-oss'
import { DatawichDataAppSpecs } from './admin/DatawichDataAppSpecs'

const app = new WebApp({
  env: GlobalAppConfig.Env,
  tags: GlobalAppConfig.Tags,
  appName: 'datawich-admin',
  wecomBotKey: DatawichConfig.wecomBotKey,
  useJwtSpecs: true,
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
  plugins: [TypicalSsoSdkPlugin(DatawichConfig.adminSSO), DatawichOssPlugin],
  appDidLoad: async () => {
    _DatawichService.init({
      database: MyDatabase.datawichDB,
      ossForSignature: new AliyunOSS(DatawichConfig.ossOptions.Default.visitor),
      // downloadRootDir: DatawichConfig.datawichDownloadDir,
    })
  },

  checkHealth: async () => {},
})
app.launch()

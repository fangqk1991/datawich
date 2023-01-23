import { DatawichConfig } from '../DatawichConfig'
import { GlobalAppConfig } from 'fc-config'
import { WebApp } from '@fangcha/backend-kit/lib/router'
import { DatawichOssPlugin } from '../services/DatawichOssPlugin'
import { DatawichOpenSwaggerDocItems } from './open/specs'
import { _DatawichService } from '../services/_DatawichService'
import { MyDatabase } from '../services/MyDatabase'
import { AliyunOSS } from '@fangcha/ali-oss'
import { VisitorCenter } from './open/VisitorCenter'

const app = new WebApp({
  env: GlobalAppConfig.Env,
  tags: GlobalAppConfig.Tags,
  appName: 'datawich-open',
  wecomBotKey: DatawichConfig.wecomBotKey,

  mainDocItems: DatawichOpenSwaggerDocItems,

  routerOptions: {
    baseURL: DatawichConfig.openBaseURL,
    backendPort: DatawichConfig.openPort,
    basicAuthProtocol: {
      findVisitor: (username: string, password: string) => {
        return VisitorCenter.findVisitor(username, password)
      },
    },
  },
  plugins: [DatawichOssPlugin],

  appDidLoad: async () => {
    _DatawichService.init({
      database: MyDatabase.datawichDB,
      ossForSignature: new AliyunOSS(DatawichConfig.ossOptions.Default.visitor),
      // downloadRootDir: DatawichConfig.datawichDownloadDir,
    })
    VisitorCenter.autoReloadVisitorCenter()
  },
})
app.launch()

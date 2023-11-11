import { FangchaApp } from '@fangcha/backend-kit'
import { DatawichConfig } from '../DatawichConfig'
import { GlobalAppConfig } from 'fc-config'
import { DatawichOssPlugin } from '../services/DatawichOssPlugin'
import { MyDatabase } from '../services/MyDatabase'
import { AliyunOSS } from '@fangcha/ali-oss'
import { _DatawichService } from '../services/_DatawichService'
import { ResqueSdkPlugin } from '@fangcha/resque-sdk'
import { MyJobServer } from '../services/MyJobServer'

const app = new FangchaApp({
  env: GlobalAppConfig.Env,
  tags: GlobalAppConfig.Tags,
  appName: 'datawich-resque',
  wecomBotKey: DatawichConfig.wecomBotKey,
  plugins: [
    DatawichOssPlugin,
    ResqueSdkPlugin({
      redisConfig: DatawichConfig.datawichResque,
      queues: [
        'HighPriorityQueue',
        'NormalPriorityQueue',
        'LowPriorityQueue',
        ...DatawichConfig.datawichResque.dynamicQueues,
      ],
      moduleMapData: {},
      jobServer: MyJobServer,
    }),
  ],
  appDidLoad: async () => {
    _DatawichService.init({
      database: MyDatabase.datawichDB,
      ossForSignature: new AliyunOSS(DatawichConfig.ossOptions.Default.visitor),
      // downloadRootDir: DatawichConfig.datawichDownloadDir,
    })
  },
})
app.launch()

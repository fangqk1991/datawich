import { FangchaApp } from '@fangcha/backend-kit'
import { ResqueObserverHelper, ResqueSdkPlugin } from '@fangcha/backend-kit/lib/resque'
import { DatawichConfig } from '../DatawichConfig'
import { GlobalAppConfig } from 'fc-config'
import { DatawichOssPlugin } from '../services/DatawichOssPlugin'
import { CommonJob } from '../services/CommonJob'
import { _DatawichService } from '@fangcha/datawich-service'
import { MyDatabase } from '../services/MyDatabase'
import { AliyunOSS } from '@fangcha/ali-oss'

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
      observer: ResqueObserverHelper.makeTypicalObserver(CommonJob),
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

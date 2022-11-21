import { DatawichConfig } from '../DatawichConfig'
import { GlobalAppConfig } from 'fc-config'
import { WebApp } from '@fangcha/backend-kit/lib/router'

const app = new WebApp({
  env: GlobalAppConfig.Env,
  tags: GlobalAppConfig.Tags,
  appName: 'datawich-open',
  wecomBotKey: DatawichConfig.wecomBotKey,

  routerOptions: {
    baseURL: DatawichConfig.openBaseURL,
    backendPort: DatawichConfig.openPort,
    basicAuthProtocol: {
      findVisitor: (username: string, password: string) => {
        return {
          visitorId: username,
          name: username,
          secrets: [password],
          permissionKeys: [],
          isEnabled: true,
        }
      },
    },
  },
  plugins: [],
  appDidLoad: async () => {},
})
app.launch()

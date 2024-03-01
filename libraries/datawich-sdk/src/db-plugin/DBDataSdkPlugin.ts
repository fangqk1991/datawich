import { SwaggerDocItem } from '@fangcha/router'
import { AppPluginProtocol } from '@fangcha/backend-kit/lib/basic'
import { DBHandleSDK, DBSdkOptions } from '../core'
import { DBDataSpecs } from './DBDataSpecs'

export const DBDataSpecDocItem: SwaggerDocItem = {
  name: 'Datawich SDK 相关',
  pageURL: '/api-docs/v1/db-data-sdk',
  specs: [...DBDataSpecs],
}

export const DBDataSdkPlugin = (options: DBSdkOptions): AppPluginProtocol => {
  return {
    appDidLoad: async () => {
      DBHandleSDK.initOptions(options)
    },
    specDocItems: [DBDataSpecDocItem],
  }
}

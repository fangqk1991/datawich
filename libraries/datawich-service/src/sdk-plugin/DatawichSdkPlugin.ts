import { SpecFactory, SwaggerDocItem } from '@fangcha/router'
import { SdkDatawichSpecs } from './SdkDatawichSpecs'
import { AppPluginProtocol } from '@fangcha/backend-kit/lib/basic'
import { DatawichService, DatawichServiceOptions } from '../sdk'
import { DatawichSystemInfo } from '../common/models'
import { SdkDatawichApis2 } from '../common/sdk-api'
import assert from '@fangcha/assert'

const factory = new SpecFactory('Datawich SDK 相关')
factory.prepare(SdkDatawichApis2.SystemInfoGet, async (ctx) => {
  const baseURL = DatawichService.options.webBaseUrl || ''
  ctx.body = {
    modelStructureBaseURL: `${baseURL}/v2/data-model/:modelKey?curTab=fragment-model-structure`,
  } as DatawichSystemInfo
})
factory.prepare(SdkDatawichApis2.OssUrlsSignature, async (ctx) => {
  const { ossKeys } = ctx.request.body
  assert.ok(!!DatawichService.ossForSignature, 'ossForSignature invalid', 500)
  assert.ok(Array.isArray(ossKeys), 'ossKeys invalid')
  ctx.body = (ossKeys as string[]).reduce((result, ossKey) => {
    result[ossKey] = DatawichService.ossForSignature.signatureURL(ossKey)
    return result
  }, {})
})

export const DatawichSpecDocItem: SwaggerDocItem = {
  name: 'Datawich SDK 相关',
  pageURL: '/api-docs/v1/datawich-sdk',
  specs: [...SdkDatawichSpecs, ...factory.buildSpecs()],
}

export const DatawichSdkPlugin = (options: DatawichServiceOptions): AppPluginProtocol => {
  return {
    appDidLoad: async () => {
      DatawichService.initOptions(options)
    },
    specDocItem: DatawichSpecDocItem,
  }
}

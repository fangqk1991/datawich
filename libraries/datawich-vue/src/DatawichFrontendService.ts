import Vue from 'vue'
import { FrontendPluginProtocol, MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { NotificationCenter } from 'notification-center-js'
import { SdkDatawichApis2 } from '@fangcha/datawich-service'
import { _DatawichAttachmentOptions, AttachmentFieldPlugin, AttachmentOptions } from './plugins/attachment'
import { FieldPluginCenter, FieldPluginProtocol } from './core'
import { DatawichSystemInfo, TinyModelInfo } from '@fangcha/datawich-service'

Vue.filter('describe_tiny_model_summary', function (val: TinyModelInfo) {
  return `${val.name} [${val.modelKey}]`
})

Vue.filter('build_model_page_url', function (modelKey: string) {
  return CommonAPI.buildUrl(DatawichFrontendService.systemInfo.modelStructureBaseURL, modelKey)
})

interface Params {
  default_loadAvailableCustomModels?: () => Promise<TinyModelInfo[]>
  attachmentOptions?: AttachmentOptions
  plugins?: FieldPluginProtocol[]
}

class _DatawichFrontendService implements FrontendPluginProtocol {
  params!: Params

  routes = []

  systemInfo: DatawichSystemInfo = {
    modelStructureBaseURL: '',
  }

  public init(params: Params = {}) {
    if (params.attachmentOptions) {
      Object.assign(_DatawichAttachmentOptions, params.attachmentOptions)
      FieldPluginCenter.addPlugin(new AttachmentFieldPlugin())
    }
    if (params.plugins) {
      FieldPluginCenter.addPlugin(...params.plugins)
    }
    this.params = params
    return this
  }

  public async reloadSystemInfo() {
    const request = MyAxios(SdkDatawichApis2.SystemInfoGet)
    this.systemInfo = await request.quickSend()
    NotificationCenter.defaultCenter().postNotification('__onDatawichSystemInfoChanged')
  }

  public onAppWillLoad() {
    this.reloadSystemInfo()
  }
}

export const DatawichFrontendService = new _DatawichFrontendService()

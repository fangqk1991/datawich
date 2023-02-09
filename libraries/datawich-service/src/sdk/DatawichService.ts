import { DatawichProxy } from './DatawichProxy'
import { AliyunOSS } from '@fangcha/ali-oss'
import { BasicAuthConfig } from '@fangcha/tools'
import { RequestFollower } from '@fangcha/tools/lib/request'

export interface DatawichServiceOptions {
  authConfig: BasicAuthConfig
  observerClass?: { new (requestId?: string): RequestFollower }
  ossForSignature?: AliyunOSS
  webBaseUrl?: string
}

class _DatawichService {
  public options!: DatawichServiceOptions
  public proxy!: DatawichProxy
  public ossForSignature!: AliyunOSS

  public initOptions(options: DatawichServiceOptions) {
    this.options = options
    this.proxy = new DatawichProxy(options.authConfig, options.observerClass)
    if (options.ossForSignature) {
      this.ossForSignature = options.ossForSignature
    }
    return this
  }
}

export const DatawichService = new _DatawichService()

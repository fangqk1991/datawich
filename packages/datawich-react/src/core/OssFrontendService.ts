interface Params {
  defaultBucketName: string
  defaultOssZone: string
}

class _OssFrontendService {
  options!: Params

  public init(options: Params) {
    this.options = options || {}
    return this
  }
}

export const OssFrontendService = new _OssFrontendService()

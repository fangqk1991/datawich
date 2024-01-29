import { FangchaOpenSession } from '@fangcha/session'
import { Context } from 'koa'

export class OpenSession extends FangchaOpenSession {
  realUserId!: string
  webSDK!: boolean

  public constructor(ctx: Context) {
    super(ctx)
    this.realUserId = this.headers['x-datawich-visitor'] || ''
    this.webSDK = !!this.headers['x-web-sdk']
  }

  public curUserStr() {
    if (!this.webSDK) {
      return super.curUserStr()
    }
    return !!this.realUserId && this.realUserId != '-' ? this.realUserId : this.visitorId
  }
}

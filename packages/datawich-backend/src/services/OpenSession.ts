import { FangchaOpenSession } from '@fangcha/session'
import { Context } from 'koa'

export class OpenSession extends FangchaOpenSession {
  realUserId!: string
  usingWebSDK!: boolean

  public constructor(ctx: Context) {
    super(ctx)
    this.realUserId = this.headers['x-datawich-visitor'] || ''
    this.usingWebSDK = !!this.headers['x-web-sdk']
  }

  public isLogin() {
    return !!this.realUserId && this.realUserId !== '-'
  }

  public curUserStr() {
    if (!this.usingWebSDK) {
      return super.curUserStr()
    }
    return this.isLogin() ? this.realUserId : this.visitorId
  }
}

import { FangchaOpenSession } from '@fangcha/session'
import { Context } from 'koa'

export class OpenSession extends FangchaOpenSession {
  realUserId!: string

  public constructor(ctx: Context) {
    super(ctx)
    this.realUserId = this.headers['x-datawich-visitor']
  }
}

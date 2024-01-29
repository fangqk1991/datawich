import { Context } from 'koa'
import assert from '@fangcha/assert'
import { _DataModel } from '../../../models/extensions/_DataModel'
import { ModelSpecHandler } from './ModelSpecHandler'
import { _ModelAuthorization } from '../../../models/extensions/_ModelAuthorization'
import { FangchaOpenSession } from '@fangcha/session'

export class AuthModelSpecHandler extends ModelSpecHandler {
  public constructor(ctx: Context) {
    super(ctx)
  }

  protected async checkModelAccessible() {
    const session = this.ctx.session as FangchaOpenSession
    const dataModel = await this.prepareModel()
    const searcher = new _ModelAuthorization().fc_searcher()
    searcher.processor().addConditionKV('model_key', dataModel.modelKey)
    searcher.processor().addConditionKV('appid', session.visitorId)
    assert.ok((await searcher.queryCount()) > 0, `${session.visitorId} 不能访问模型 ${dataModel.modelKey}`)
  }

  public async handle(handler: (dataModel: _DataModel) => Promise<void>) {
    const dataModel = await this.prepareModel()
    await this.checkModelAccessible()
    await handler(dataModel)
  }
}

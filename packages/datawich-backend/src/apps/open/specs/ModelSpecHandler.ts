import { Context } from 'koa'
import assert from '@fangcha/assert'
import { _DataModel } from '../../../models/extensions/_DataModel'
import { _ModelMilestone } from '../../../models/extensions/_ModelMilestone'

export class ModelSpecHandler {
  public readonly ctx: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
  }

  protected _model!: _DataModel
  protected async prepareModel() {
    if (!this._model) {
      const dataModel = await _DataModel.findModel(this.ctx.params.modelKey)
      assert.ok(!!dataModel, 'DataModel 不存在')
      this._model = dataModel
    }
    return this._model
  }

  public async handle(handler: (dataModel: _DataModel) => Promise<void>) {
    const dataModel = await this.prepareModel()
    await handler(dataModel)
  }

  public async handleMilestone(handler: (milestone: _ModelMilestone) => Promise<void>) {
    const dataModel = await this.prepareModel()
    const milestone = (await _ModelMilestone.findMilestone(
      dataModel.modelKey,
      this.ctx.params.tagName
    )) as _ModelMilestone
    await handler(milestone)
  }
}

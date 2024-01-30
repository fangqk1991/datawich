import { Context } from 'koa'
import assert from '@fangcha/assert'
import { _DataModel } from '../../../models/extensions/_DataModel'
import { ModelSpecHandler } from './ModelSpecHandler'
import { _ModelAuthorization } from '../../../models/extensions/_ModelAuthorization'
import { OpenSession } from '../../../services/OpenSession'
import { ModelDataInfo } from '../../../services/ModelDataInfo'
import { SessionChecker } from '../../../services/SessionChecker'
import { GeneralPermission } from '@web/datawich-common/models'
import { ModelDataHandler } from '../../../services/ModelDataHandler'

export class AuthModelSpecHandler extends ModelSpecHandler {
  public constructor(ctx: Context) {
    super(ctx)
  }

  protected async checkModelAccessible() {
    const session = this.ctx.session as OpenSession
    const dataModel = await this.prepareModel()
    const searcher = new _ModelAuthorization().fc_searcher()
    searcher.processor().addConditionKV('model_key', dataModel.modelKey)
    searcher.processor().addConditionKV('appid', session.visitorId)
    assert.ok((await searcher.queryCount()) > 0, `${session.visitorId} 不能访问模型 ${dataModel.modelKey}`)
    if (session.usingWebSDK && this.ctx.method !== 'GET') {
      assert.ok(session.isLogin(), `当前操作需要登录`)
    }
  }

  public async handle(handler: (dataModel: _DataModel) => Promise<void>) {
    const dataModel = await this.prepareModel()
    await this.checkModelAccessible()
    await handler(dataModel)
  }

  private _dataInfo!: ModelDataInfo
  public async prepareDataInfo() {
    if (!this._dataInfo) {
      const ctx = this.ctx
      const dataModel = await this.prepareModel()
      const dataId = this.ctx.params.dataId
      const dataInfo = (await ModelDataInfo.findDataInfo(dataModel, dataId))!
      assert.ok(!!dataInfo, `数据[dataId = ${dataId}]不存在`, 404)

      const session = ctx.session as OpenSession
      if (session.usingWebSDK && ctx.method !== 'GET') {
        const sessionChecker = new SessionChecker(ctx)
        if (
          !(await sessionChecker.checkModelPermission(
            dataModel,
            ctx.method === 'GET' ? GeneralPermission.AccessOthersData : GeneralPermission.P_HandleOthersData
          ))
        ) {
          const dataHandler = new ModelDataHandler(dataModel)
          assert.ok(
            await dataHandler.checkDataAccessible(sessionChecker.email, dataInfo.dataId),
            `您没有查看/编辑本条数据的权限`,
            403
          )
        }
      }
      this._dataInfo = dataInfo
    }
    return this._dataInfo
  }

  public async handleDataInfo(handler: (dataInfo: ModelDataInfo, dataApp: _DataModel) => Promise<void>) {
    await this.checkModelAccessible()
    const dataApp = await this.prepareModel()
    const dataInfo = await this.prepareDataInfo()
    await handler(dataInfo, dataApp)
  }
}

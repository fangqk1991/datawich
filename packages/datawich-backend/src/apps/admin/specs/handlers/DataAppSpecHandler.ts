import assert from '@fangcha/assert'
import { Context } from 'koa'
import { SessionChecker } from '../../../../services/SessionChecker'
import { ModelDataInfo } from '../../../../services/ModelDataInfo'
import { ModelDataHandler } from '../../../../services/ModelDataHandler'
import { _DataModel } from '../../../../models/extensions/_DataModel'
import { AccessLevel, GeneralPermission } from '@web/datawich-common/models'
import { FangchaSession } from '@fangcha/router/lib/session'

export class DataAppSpecHandler {
  ctx!: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
  }

  private _dataApp!: _DataModel
  public async prepareDataApp() {
    if (!this._dataApp) {
      const ctx = this.ctx
      const dataModel = await _DataModel.findModel(ctx.params.modelKey)
      assert.ok(!!dataModel, '应用不存在')
      if (!(await new SessionChecker(ctx).checkModelPermission(dataModel, GeneralPermission.ManageModel))) {
        assert.ok(!!dataModel.isOnline, `应用暂时停用，如有疑问，请联系 ${dataModel.author}`)
      }
      await new SessionChecker(ctx).assertModelAccessible(dataModel)
      this._dataApp = dataModel
    }
    return this._dataApp
  }

  private _dataInfo!: ModelDataInfo
  public async prepareDataInfo() {
    if (!this._dataInfo) {
      const ctx = this.ctx
      const dataModel = await this.prepareDataApp()
      const dataInfo = (await ModelDataInfo.findDataInfo(dataModel, this.ctx.params.dataId))!
      assert.ok(!!dataInfo, '数据不存在')
      const sessionChecker = new SessionChecker(ctx)
      if (!(await sessionChecker.checkModelPermission(dataModel, GeneralPermission.AccessOthersData))) {
        const dataHandler = new ModelDataHandler(dataModel)
        assert.ok(
          await dataHandler.checkDataAccessible(sessionChecker.email, dataInfo.dataId),
          `您没有查看/编辑本条数据的权限 [${dataInfo.dataId}]`,
          403
        )
      }
      this._dataInfo = dataInfo
    }
    return this._dataInfo
  }

  public async handle(handler: (dataApp: _DataModel) => Promise<void>) {
    const dataApp = await this.prepareDataApp()
    await handler(dataApp)
  }

  public async handleDataSearch(handler: (dataApp: _DataModel, options: {}) => Promise<void>) {
    const dataModel = await this.prepareDataApp()
    const ctx = this.ctx
    const session = ctx.session as FangchaSession
    const options = ctx.method === 'GET' ? ctx.request.query : ctx.request.body
    options['relatedUser'] = session.curUserStr()
    if (
      dataModel.accessLevel !== AccessLevel.Public_Content &&
      !(await new SessionChecker(ctx).checkModelPermission(dataModel, GeneralPermission.AccessOthersData))
    ) {
      options['lockedUser'] = session.curUserStr()
    }
    await handler(dataModel, options)
  }

  public async handleDataInfo(handler: (dataInfo: ModelDataInfo, dataApp: _DataModel) => Promise<void>) {
    const dataApp = await this.prepareDataApp()
    const dataInfo = await this.prepareDataInfo()
    await handler(dataInfo, dataApp)
  }
}

import assert from '@fangcha/assert'
import { Context } from 'koa'
import { _DataModel } from '../../../../models/extensions/_DataModel'
import { _ModelField } from '../../../../models/extensions/_ModelField'
import { _FieldLink } from '../../../../models/extensions/_FieldLink'
import { _ModelPanel } from '../../../../models/extensions/_ModelPanel'

export class DataModelSpecHandler {
  ctx!: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
  }

  private _dataModel!: _DataModel
  private async prepareDataModel() {
    if (!this._dataModel) {
      const ctx = this.ctx
      const dataModel = await _DataModel.findModel(ctx.params.modelKey)
      assert.ok(!!dataModel, 'DataModel Not Found')
      if (ctx.method !== 'GET') {
        assert.ok(!dataModel.isLocked, '模型已被锁定，不可修改')
      }
      // if (!(await new SessionChecker(ctx).checkModelPermission(dataModel, GeneralPermission.ManageModel))) {
      //   assert.ok(!!dataModel.isOnline, `应用暂时停用，如有疑问，请联系 ${dataModel.author}`)
      // }
      // await new SessionChecker(ctx).assertModelAccessible(dataModel)
      this._dataModel = dataModel
    }
    return this._dataModel
  }

  private _modelField!: _ModelField
  private async prepareModelField() {
    if (!this._modelField) {
      const ctx = this.ctx
      const dataModel = await this.prepareDataModel()
      const modelField = await _ModelField.findModelField(dataModel.modelKey, ctx.params.fieldKey)
      assert.ok(!!modelField, 'ModelField Not Found')
      this._modelField = modelField
    }
    return this._modelField
  }

  private _modelPanel!: _ModelPanel
  private async prepareModelPanel() {
    if (!this._modelPanel) {
      const ctx = this.ctx
      const dataModel = await this.prepareDataModel()
      const panel = (await _ModelPanel.findWithUid(ctx.params.panelId))!
      assert.ok(!!panel, 'ModelPanel Not Found')
      assert.ok(dataModel.modelKey === panel.modelKey, 'modelKey error')
      this._modelPanel = panel
    }
    return this._modelPanel
  }

  public async handle(handler: (dataModel: _DataModel) => Promise<void>) {
    const dataModel = await this.prepareDataModel()
    await handler(dataModel)
  }

  public async handleField(handler: (modelField: _ModelField, dataModel: _DataModel) => Promise<void>) {
    const dataModel = await this.prepareDataModel()
    const modelField = await this.prepareModelField()
    await handler(modelField, dataModel)
  }

  public async handleFieldLink(handler: (fieldLink: _FieldLink, dataModel: _DataModel) => Promise<void>) {
    const dataModel = await this.prepareDataModel()
    const fieldLink = (await _FieldLink.findLink(this.ctx.params.linkId))!
    assert.ok(!!fieldLink, 'FieldLink Not Found')
    await handler(fieldLink, dataModel)
  }

  public async handleModelPanel(handler: (panel: _ModelPanel, dataModel: _DataModel) => Promise<void>) {
    const dataModel = await this.prepareDataModel()
    const modelPanel = await this.prepareModelPanel()
    await handler(modelPanel, dataModel)
  }
}

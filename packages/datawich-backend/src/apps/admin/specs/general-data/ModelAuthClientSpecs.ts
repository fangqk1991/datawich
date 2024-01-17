import { SpecFactory } from '@fangcha/router'
import assert from '@fangcha/assert'
import { ModelClientApis } from '@web/datawich-common/web-api'
import { SessionChecker } from '../../../../services/SessionChecker'
import { ModelAuthHandler } from '../../../../services/ModelAuthHandler'
import { DataModelSpecHandler } from '../handlers/DataModelSpecHandler'
import { ClientAuthParams, GeneralPermission } from '@web/datawich-common/models'

const factory = new SpecFactory('模型 API 访问者')

factory.prepare(ModelClientApis.ModelAuthClientListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    const feeds = await new ModelAuthHandler(dataModel).getAuthModels()
    ctx.body = feeds.map((item) => item.fc_pureModel())
  })
})

factory.prepare(ModelClientApis.ModelAuthClientListUpdate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    const params = ctx.request.body as ClientAuthParams[]
    assert.ok(Array.isArray(params), '参数不合法')
    params.forEach((item) => {
      assert.ok(!!item.appid, '参数[appid]不合法')
      assert.ok(!!item.modelKey, '参数[modelKey]不合法')
      assert.ok(item.checked !== undefined, '参数[checked]不合法')
    })
    await new ModelAuthHandler(dataModel).updateAuthModels(params)
    ctx.status = 200
  })
})

export const ModelAuthClientSpecs = factory.buildSpecs()

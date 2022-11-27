import { SpecFactory } from '@fangcha/router'
import assert from '@fangcha/assert'
import { ModelFieldApis } from '@web/datawich-common/web-api'
import { DisplayScope, DisplayScopeDescriptor } from '@web/datawich-common/models'
import { DataModelSpecHandler } from '../handlers/DataModelSpecHandler'

const factory = new SpecFactory('模型自定义展示列')

factory.prepare(ModelFieldApis.DataDisplayColumnUpdate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const { data, displayScope } = ctx.request.body
    assert.ok(Object.values(DisplayScope).includes(displayScope), 'displayScope 参数不合法')
    await dataModel.updateCustomDisplayColumns(data, displayScope)
    ctx.status = 200
  })
})

factory.prepare(ModelFieldApis.DataModelDisplayColumnListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const displayScope = ctx.request.params.displayScope as DisplayScope
    assert.ok(DisplayScopeDescriptor.checkValueValid(displayScope), 'displayScope 参数不合法')
    const feeds = await dataModel.getModelDisplayColumnList(displayScope)
    ctx.body = feeds.map((feed) => feed.fc_pureModel())
    ctx.status = 200
  })
})
export const ModelDisplayColumnSpecs = factory.buildSpecs()

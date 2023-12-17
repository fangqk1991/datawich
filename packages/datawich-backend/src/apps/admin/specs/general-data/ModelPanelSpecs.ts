import { SpecFactory } from '@fangcha/router'
import { SessionChecker } from '../../../../services/SessionChecker'
import { DataModelHandler } from '../../../../services/DataModelHandler'
import { DataModelSpecHandler } from '../handlers/DataModelSpecHandler'
import { ModelPanelApis } from '@web/datawich-common/web-api'
import assert from '@fangcha/assert'

const factory = new SpecFactory('模型面板')

factory.prepare(ModelPanelApis.ModelPanelListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    const searcher = new DataModelHandler(dataModel).getPanelSearcher()
    ctx.body = await searcher.queryJsonFeeds()
  })
})

factory.prepare(ModelPanelApis.ModelPanelCreate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const checker = new SessionChecker(ctx)
    await checker.assertModelAccessible(dataModel)
    const panel = await new DataModelHandler(dataModel).createPanel({
      ...ctx.request.body,
      author: checker.email,
    })
    ctx.body = panel.modelForClient()
  })
})

factory.prepare(ModelPanelApis.ModelPanelGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleModelPanel(async (panel, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    ctx.body = panel.modelForClient()
  })
})

factory.prepare(ModelPanelApis.ModelPanelUpdate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleModelPanel(async (panel, dataModel) => {
    const checker = new SessionChecker(ctx)
    await checker.assertModelAccessible(dataModel)
    assert.ok(checker.email === panel.author, `Only the author can modify it.`)
    await panel.updateInfos(ctx.request.body)
    ctx.body = panel.modelForClient()
  })
})

factory.prepare(ModelPanelApis.ModelPanelDelete, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleModelPanel(async (panel, dataModel) => {
    const checker = new SessionChecker(ctx)
    await checker.assertModelAccessible(dataModel)
    assert.ok(checker.email === panel.author, `Only the author can modify it.`)
    await panel.deleteFromDB()
    ctx.status = 200
  })
})

export const ModelPanelSpecs = factory.buildSpecs()

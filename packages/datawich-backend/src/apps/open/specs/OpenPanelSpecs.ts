import { SpecFactory } from '@fangcha/router'
import { DataModelHandler } from '../../../services/DataModelHandler'
import assert from '@fangcha/assert'
import { OpenPanelApis } from '@fangcha/datawich-service'
import { DataModelSpecHandler } from '../../../services/DataModelSpecHandler'
import { OpenSession } from '../../../services/OpenSession'

const factory = new SpecFactory('模型面板')

factory.prepare(OpenPanelApis.ModelPanelListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const session = ctx.session as OpenSession
    const searcher = new DataModelHandler(dataModel).getPanelSearcher()
    searcher.processor().addSpecialCondition('is_public = 1 OR author = ?', session.realUserId)
    ctx.body = await searcher.queryJsonFeeds()
  })
})

factory.prepare(OpenPanelApis.ModelPanelCreate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const session = ctx.session as OpenSession
    const panel = await new DataModelHandler(dataModel).createPanel({
      ...ctx.request.body,
      author: session.realUserId,
    })
    ctx.body = panel.modelForClient()
  })
})

factory.prepare(OpenPanelApis.ModelPanelInfoGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleModelPanel(async (panel) => {
    ctx.body = panel.modelForClient()
  })
})

factory.prepare(OpenPanelApis.ModelPanelUpdate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleModelPanel(async (panel) => {
    const session = ctx.session as OpenSession
    assert.ok(session.realUserId === panel.author, `Only the author can modify it.`)
    await panel.updateInfos(ctx.request.body)
    ctx.body = panel.modelForClient()
  })
})

factory.prepare(OpenPanelApis.ModelPanelDelete, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleModelPanel(async (panel) => {
    const session = ctx.session as OpenSession
    assert.ok(session.realUserId === panel.author, `Only the author can modify it.`)
    await panel.deleteFromDB()
    ctx.status = 200
  })
})

export const OpenPanelSpecs = factory.buildSpecs()

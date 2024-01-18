import { SpecFactory } from '@fangcha/router'
import assert from '@fangcha/assert'
import { SessionChecker } from '../../../../services/SessionChecker'
import { DataModelHandler } from '../../../../services/DataModelHandler'
import { _ModelMilestone } from '../../../../models/extensions/_ModelMilestone'
import { DataModelSpecHandler } from '../../../../services/DataModelSpecHandler'
import { ModelMilestoneApis } from '@web/datawich-common/admin-apis'

const factory = new SpecFactory('元信息版本')

factory.prepare(ModelMilestoneApis.ModelMilestoneListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    const searcher = new DataModelHandler(dataModel).getMilestoneSearcher()
    const items = await searcher.queryAllFeeds()
    ctx.body = items.map((feed) => feed.fc_pureModel())
  })
})

factory.prepare(ModelMilestoneApis.ModelMilestoneCreate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    await new DataModelHandler(dataModel).createMilestone(ctx.request.body)
    ctx.status = 200
  })
})

factory.prepare(ModelMilestoneApis.ModelMilestoneImport, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    await new DataModelHandler(dataModel).importMilestone(ctx.request.body)
    ctx.status = 200
  })
})

factory.prepare(ModelMilestoneApis.ModelMilestoneDelete, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    assert.ok(false, '暂不支持删除操作', 403)
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    const milestone = await _ModelMilestone.findMilestone(dataModel.modelKey, ctx.params.tagName)
    assert.ok(!!milestone, '版本不存在')
    await milestone.deleteFromDB()
    ctx.status = 200
  })
})

factory.prepare(ModelMilestoneApis.ModelMasterMetadataGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    ctx.set('Content-disposition', `attachment; filename=${dataModel.modelKey}-master.json`)
    ctx.body = JSON.stringify(await new DataModelHandler(dataModel).getFullMetadata(), null, 2)
  })
})

factory.prepare(ModelMilestoneApis.ModelMilestoneMetadataGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    const milestone = await _ModelMilestone.findMilestone(dataModel.modelKey, ctx.params.tagName)
    assert.ok(!!milestone, '版本不存在')
    ctx.set('Content-disposition', `attachment; filename=${dataModel.modelKey}-${milestone.tagName}.json`)
    ctx.body = JSON.stringify(milestone.getMetadata(), null, 2)
  })
})

export const ModelMilestoneSpecs = factory.buildSpecs()

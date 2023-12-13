import { SpecFactory } from '@fangcha/router'
import { _DataModel } from '../../../models/extensions/_DataModel'
import { OpenDataModelApis } from '@web/datawich-common/open-api'
import { DataModelHandler } from '../../../services/DataModelHandler'
import { ModelSpecHandler } from './ModelSpecHandler'

const factory = new SpecFactory('Data Model')

factory.prepare(OpenDataModelApis.ModelListGet, async (ctx) => {
  const { keywords } = ctx.request.query
  const searcher = new _DataModel().fc_searcher()
  if (keywords) {
    searcher.processor().addSpecialCondition('model_key LIKE ?', `%${keywords}%`)
  }
  const items = await searcher.queryAllFeeds()
  ctx.body = items.map((item) => item.modelForClient())
})

factory.prepare(OpenDataModelApis.ModelMasterMetadataGet, async (ctx) => {
  await new ModelSpecHandler(ctx).handle(async (dataModel) => {
    ctx.body = await new DataModelHandler(dataModel).getFullMetadata()
  })
})

factory.prepare(OpenDataModelApis.ModelTagListGet, async (ctx) => {
  await new ModelSpecHandler(ctx).handle(async (dataModel) => {
    const items = await new DataModelHandler(dataModel).getMilestoneSearcher().queryAllFeeds()
    ctx.body = items.map((feed) => feed.fc_pureModel())
  })
})

factory.prepare(OpenDataModelApis.ModelTagMetadataGet, async (ctx) => {
  await new ModelSpecHandler(ctx).handleMilestone(async (milestone) => {
    ctx.body = milestone.getMetadata()
  })
})

export const OpenDataModelSpecs = factory.buildSpecs()

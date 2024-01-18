import { SpecFactory } from '@fangcha/router'
import { _DataModel } from '../../../models/extensions/_DataModel'
import { DataModelHandler } from '../../../services/DataModelHandler'
import { ModelSpecHandler } from './ModelSpecHandler'
import { OpenDataModelApis } from '@fangcha/datawich-service'
import { FangchaOpenSession } from '@fangcha/session'

const factory = new SpecFactory('Data Model')

factory.prepare(OpenDataModelApis.ModelListGet, async (ctx) => {
  const session = ctx.session as FangchaOpenSession
  const { keywords } = ctx.request.query
  const searcher = new _DataModel().fc_searcher()
  searcher
    .processor()
    .addSpecialCondition(
      `EXISTS (SELECT model_authorization.model_key FROM model_authorization WHERE model_authorization.model_key = data_model.model_key AND model_authorization.appid = ?)`,
      session.curUserStr()
    )
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

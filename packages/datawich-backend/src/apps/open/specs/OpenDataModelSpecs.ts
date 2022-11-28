import { SpecFactory } from '@fangcha/router'
import { Context } from 'koa'
import assert from '@fangcha/assert'
import { _DataModel } from '../../../models/extensions/_DataModel'
import { _ModelMilestone } from '../../../models/extensions/_ModelMilestone'
import { OpenDataModelApis } from '@web/datawich-common/open-api'
import { DataModelHandler } from '../../../services/DataModelHandler'

const prepareDataModel = async (ctx: Context) => {
  const dataModel = await _DataModel.findModel(ctx.params.modelKey)
  assert.ok(!!dataModel, 'DataModel 不存在')
  return dataModel as _DataModel
}

const prepareModelMilestone = async (ctx: Context) => {
  const dataModel = await prepareDataModel(ctx)
  const milestone = (await _ModelMilestone.findMilestone(dataModel.modelKey, ctx.params.tagName)) as _ModelMilestone
  assert.ok(!!milestone, 'Milestone 不存在')
  return milestone
}

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
  const dataModel = await prepareDataModel(ctx)
  ctx.body = await new DataModelHandler(dataModel).getFullMetadata()
})

factory.prepare(OpenDataModelApis.ModelTagListGet, async (ctx) => {
  const dataModel = await prepareDataModel(ctx)
  const items = await dataModel.getMilestoneSearcher().queryAllFeeds()
  ctx.body = items.map((feed) => feed.fc_pureModel())
})

factory.prepare(OpenDataModelApis.ModelTagMetadataGet, async (ctx) => {
  const milestone = await prepareModelMilestone(ctx)
  ctx.body = milestone.getMetadata()
})

export const OpenDataModelSpecs = factory.buildSpecs()

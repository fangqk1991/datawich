import { SpecFactory } from '@fangcha/router'
import assert from '@fangcha/assert'
import { DataModelApis } from '@web/datawich-common/admin-apis'
import { _DataModel } from '../../../../models/extensions/_DataModel'
import { SessionChecker } from '../../../../services/SessionChecker'
import { ModelFullMetadata } from '@fangcha/datawich-service'
import { DataModelHandler } from '../../../../services/DataModelHandler'
import { _DatawichService } from '../../../../services/_DatawichService'
import { FangchaSession } from '@fangcha/session'
import { ModelDataHandler } from '../../../../services/ModelDataHandler'
import { DataModelSpecHandler } from '../../../../services/DataModelSpecHandler'
import { GeneralPermission, ModelType } from '@web/datawich-common/models'

const factory = new SpecFactory('数据模型')

factory.prepare(DataModelApis.DataModelListGet, async (ctx) => {
  const searcher = new _DataModel().fc_searcher(ctx.request.query)
  searcher.processor().setLimitInfo(0, -1)
  const feeds = await searcher.queryFeeds()
  ctx.body = feeds.map((feed) => feed.modelForClient())
})

factory.prepare(DataModelApis.DataModelAccessibleCheck, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    ctx.status = 200
  })
})

factory.prepare(DataModelApis.DataModelClone, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const session = ctx.session as FangchaSession
    const { to_key } = ctx.request.body
    const toModel = await new DataModelHandler(dataModel).cloneToModel(to_key, session.curUserStr())
    ctx.body = toModel.modelForClient()
  })
})

factory.prepare(DataModelApis.DataModelFullMetadataGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    ctx.set('Content-disposition', `attachment; filename=${dataModel.modelKey}.json`)
    ctx.body = JSON.stringify(await new DataModelHandler(dataModel).getFullMetadata(), null, 2)
  })
})

factory.prepare(DataModelApis.DataModelInfoGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    const data = dataModel.modelForClient()
    data.powerData = await new SessionChecker(ctx).getScopePowerData(dataModel.modelKey)
    ctx.body = data
  })
})

factory.prepare(DataModelApis.DataModelOuterModelListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    const outerModels = await dataModel.getOuterModelsInUse()
    ctx.body = outerModels.map((feed) => feed.fc_pureModel())
  })
})

factory.prepare(DataModelApis.DataModelCreate, async (ctx) => {
  const session = ctx.session as FangchaSession
  const params = { ...ctx.request.body }
  params.author = session.curUserStr()
  const dataModel = await _DataModel.generateModel(params)
  ctx.body = dataModel.fc_pureModel()
})

factory.prepare(DataModelApis.DataModelImport, async (ctx) => {
  const session = ctx.session as FangchaSession
  const params = ctx.request.body as ModelFullMetadata
  params.fieldLinks = params.fieldLinks || []
  params.fieldIndexes = params.fieldIndexes || []
  params.modelFields = params.modelFields || []
  assert.ok(params.systemVersion === _DatawichService.version, `当前系统只支持 ${_DatawichService.version} 版本的数据`)
  assert.ok(!!params.modelKey, `modelKey 信息缺失`)
  assert.ok(!!params.dataModel, `dataModel 信息缺失`)
  assert.ok(!(await _DataModel.findModel(params.modelKey)), `${params.modelKey} 模型已存在`)
  const dataModel = await _DataModel.generateFullModel(params, session.curUserStr())
  ctx.body = dataModel.fc_pureModel()
})

factory.prepare(DataModelApis.DataModelUpdate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    await dataModel.updateFeed(ctx.request.body)
    ctx.status = 200
  })
})

factory.prepare(DataModelApis.DataModelDelete, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    await new DataModelHandler(dataModel).destroyModel()
    ctx.status = 200
  })
})

factory.prepare(DataModelApis.DataModelRecordsEmpty, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const session = ctx.session as FangchaSession
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    await dataModel.removeAllRecords(session.curUserStr())
    ctx.status = 200
  })
})

factory.prepare(DataModelApis.DataModelSummaryInfoGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    ctx.body = {
      count: await new ModelDataHandler(dataModel).getDataCount(),
    }
  })
})

factory.prepare(DataModelApis.DataOpenModelListGet, async (ctx) => {
  const searcher = new _DataModel().fc_searcher({ isLibrary: 1 })
  const feeds = await searcher.queryFeeds()
  ctx.body = feeds.map((feed) => feed.modelForClient())
})

factory.prepare(DataModelApis.DataContentModelListGet, async (ctx) => {
  const searcher = new _DataModel().fc_searcher({ modelType: ModelType.ContentModel })
  const feeds = await searcher.queryFeeds()
  ctx.body = feeds.map((feed) => feed.modelForClient())
})

export const DataModelSpecs = factory.buildSpecs()

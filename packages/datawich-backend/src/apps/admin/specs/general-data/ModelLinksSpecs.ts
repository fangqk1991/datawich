import { SpecFactory } from '@fangcha/router'
import { DataModelApis } from '@web/datawich-common/web-api'
import { SessionChecker } from '../../../../services/SessionChecker'
import { FieldLinkModel } from '@fangcha/datawich-service'
import { _FieldLink } from '../../../../models/extensions/_FieldLink'
import { DataModelSpecHandler } from '../handlers/DataModelSpecHandler'

const factory = new SpecFactory('模型关联信息')

factory.prepare(DataModelApis.ModelHoldingLinkListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    const feeds = await dataModel.getHoldingLinks()
    const result: FieldLinkModel[] = []
    for (const feed of feeds) {
      result.push(await feed.modelWithRefFields())
    }
    ctx.body = result
  })
})

factory.prepare(DataModelApis.ModelHoldingLinkCreate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    const params = ctx.request.body
    params.modelKey = dataModel.modelKey
    const link = await _FieldLink.createLink(params)
    ctx.body = await link.modelWithRefFields()
  })
})

factory.prepare(DataModelApis.ModelHoldingLinkUpdate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleFieldLink(async (fieldLink, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    const params = ctx.request.body
    await fieldLink.updateLinkInfo(params)
    ctx.status = 200
  })
})

factory.prepare(DataModelApis.ModelHoldingLinkDelete, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleFieldLink(async (fieldLink, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    await fieldLink.dropLink()
    ctx.status = 200
  })
})

export const ModelLinksSpecs = factory.buildSpecs()

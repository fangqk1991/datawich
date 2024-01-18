import { SpecFactory } from '@fangcha/router'
import { ModelGroupApis } from '@web/datawich-common/admin-apis'
import { DataModelSpecHandler } from '../handlers/DataModelSpecHandler'

const factory = new SpecFactory('模型组')

factory.prepare(ModelGroupApis.ModelLinkedGroupListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const groups = await dataModel.getLinkedGroups()
    ctx.body = groups.map((feed) => feed.fc_pureModel())
  })
})

export const ModelGroupSpecs = factory.buildSpecs()

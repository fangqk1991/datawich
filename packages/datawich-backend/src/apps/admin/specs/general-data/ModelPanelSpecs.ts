import { SpecFactory } from '@fangcha/router'
import { SessionChecker } from '../../../../services/SessionChecker'
import { DataModelHandler } from '../../../../services/DataModelHandler'
import { DataModelSpecHandler } from '../handlers/DataModelSpecHandler'
import { ModelPanelApis } from '@web/datawich-common/web-api'

const factory = new SpecFactory('模型面板')

factory.prepare(ModelPanelApis.ModelPanelListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel)
    const searcher = new DataModelHandler(dataModel).getPanelSearcher()
    ctx.body = await searcher.queryJsonFeeds()
  })
})

export const ModelPanelSpecs = factory.buildSpecs()

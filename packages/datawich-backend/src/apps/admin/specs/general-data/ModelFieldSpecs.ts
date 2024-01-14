import { SpecFactory } from '@fangcha/router'
import assert from '@fangcha/assert'
import { ModelFieldApis } from '@web/datawich-common/web-api'
import { FieldLinkModel, ModelFieldModel } from '@fangcha/datawich-service'
import { SessionChecker } from '../../../../services/SessionChecker'
import { _ModelField } from '../../../../models/extensions/_ModelField'
import { DataModelSpecHandler } from '../handlers/DataModelSpecHandler'
import { RawTableHandler } from '../../../../services/RawTableHandler'
import { _DatawichService } from '../../../../services/_DatawichService'
import { GeneralPermission } from '@web/datawich-common/models'

const factory = new SpecFactory('模型字段')

factory.prepare(ModelFieldApis.DataModelFieldListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const feeds = await dataModel.getFields()
    ctx.body = feeds.map((feed) => feed.modelForClient())
  })
})

factory.prepare(ModelFieldApis.DataModelAllFieldsDestroy, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    await dataModel.removeAllCustomFields()
    ctx.status = 200
  })
})

factory.prepare(ModelFieldApis.DataModelFieldsRebuild, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    const { rawTableName } = ctx.request.body
    const handler = new RawTableHandler(_DatawichService.database, rawTableName)
    assert.ok(await handler.checkTableExists(), `rawTableName(${rawTableName}) not exists.`)
    await dataModel.removeAllCustomFields()
    await handler.injectFieldsToDataModel(dataModel)
    ctx.status = 200
  })
})

factory.prepare(ModelFieldApis.DataModelVisibleFieldListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const feeds = await dataModel.getVisibleFields()
    const allLinks = await dataModel.getFieldLinks()
    const uniqueMap = await dataModel.getUniqueColumnMap()
    const result: ModelFieldModel[] = []
    for (const feed of feeds) {
      const data = feed.modelForClient()
      const links = allLinks.filter((link) => link.fieldKey === feed.fieldKey)
      const linkModels: FieldLinkModel[] = []
      for (const link of links) {
        linkModels.push(await link.modelWithRefFields())
      }
      data.refFieldLinks = linkModels
      data.isUnique = uniqueMap[feed.fieldKey] ? 1 : 0
      result.push(data)
    }
    ctx.body = result
  })
})

factory.prepare(ModelFieldApis.DataModelFieldLinkListGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const feeds = await dataModel.getFieldLinks()
    const result: FieldLinkModel[] = []
    for (const feed of feeds) {
      result.push(await feed.modelWithRefFields())
    }
    ctx.body = result
  })
})

factory.prepare(ModelFieldApis.DataModelFieldTop, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    await dataModel.topField(ctx.params.fieldKey)
    ctx.status = 200
  })
})

factory.prepare(ModelFieldApis.DataModelFieldsSort, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    await dataModel.sortFields(ctx.request.body)
    ctx.status = 200
  })
})

factory.prepare(ModelFieldApis.DataModelFieldCreate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    const field = await dataModel.createField(ctx.request.body)
    ctx.body = field.modelForClient()
  })
})

factory.prepare(ModelFieldApis.DataModelFieldsBatchImport, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    const paramsList = Array.isArray(ctx.request.body) ? ctx.request.body : [ctx.request.body]
    for (const params of paramsList) {
      const field = await dataModel.createField(params)
      ctx.body = field.modelForClient()
    }
  })
})

factory.prepare(ModelFieldApis.DataModelFieldDataClone, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleField(async (toField, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    const { copyFromFieldKey } = ctx.request.body
    const fromField = await _ModelField.findModelField(dataModel.modelKey, copyFromFieldKey)
    assert.ok(!!fromField, 'Source ModelField Not Found')
    await dataModel.cloneFieldData(fromField, toField)
    ctx.status = 200
  })
})

factory.prepare(ModelFieldApis.DataSystemModelFieldUpdate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleField(async (modelField, dataModel) => {
    const params = ctx.request.body
    const options = {
      star: params.star,
      name: params.name,
    }
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    assert.ok(!!modelField.isSystem, '本接口只能修改系统字段')
    await dataModel.modifyField(modelField, options as any)
    ctx.body = modelField.modelForClient()
    ctx.status = 200
  })
})

factory.prepare(ModelFieldApis.DataModelFieldUpdate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleField(async (modelField, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    assert.ok(!modelField.isSystem, '本接口不能修改系统字段')
    await dataModel.modifyField(modelField, ctx.request.body)
    ctx.body = modelField.modelForClient()
    ctx.status = 200
  })
})

factory.prepare(ModelFieldApis.DataModelFieldHiddenUpdate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleField(async (modelField, dataModel) => {
    const { isHidden } = ctx.request.body
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    await dataModel.modifyField(modelField, {
      isHidden: isHidden,
    } as any)
    ctx.body = modelField.modelForClient()
  })
})

factory.prepare(ModelFieldApis.DataModelFieldDelete, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleField(async (modelField, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    assert.ok(!modelField.isSystem, '本接口不能修改系统字段')
    await dataModel.deleteField(modelField)
    ctx.status = 200
  })
})

factory.prepare(ModelFieldApis.DataModelFieldActionsUpdate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleField(async (modelField, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    assert.ok(!modelField.isSystem, '本接口不能修改系统字段')
    await modelField.updateActions(ctx.request.body)
    ctx.status = 200
  })
})

export const ModelFieldSpecs = factory.buildSpecs()

import { SpecFactory } from '@fangcha/router'
import assert from '@fangcha/assert'
import { ModelFieldApis } from '@web/datawich-common/web-api'
import {
  FieldLinkModel,
  FieldType,
  ModelFieldModel,
} from '@fangcha/datawich-service/lib/common/models'
import { SessionChecker } from '../../../../services/SessionChecker'
import { _ModelField } from '../../../../models/extensions/_ModelField'
import { _ModelFieldAction } from '../../../../models/extensions/_ModelFieldAction'
import { DataModelSpecHandler } from '../handlers/DataModelSpecHandler'
import { RawTableHandler } from '../../../../services/RawTableHandler'
import { _DatawichService } from '../../../../services/_DatawichService'
import {
  DisplayScope,
  FieldDisplayMode,
  GeneralPermission,
  ModelNotifyTemplateModel
} from '@web/datawich-common/models'

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
    const fieldGroupMap = await dataModel.getFieldGroupMap()
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
      if (fieldGroupMap[feed.groupKey]) {
        data.groupName = fieldGroupMap[feed.groupKey].name
        data.fieldDisplayMode = fieldGroupMap[feed.groupKey].displayMode as FieldDisplayMode
        data.fieldDisplayTmpl = fieldGroupMap[feed.groupKey].displayTmpl
      }
      result.push(data)
    }
    ctx.body = result
  })
})

factory.prepare(ModelFieldApis.DataModelListCustomFieldsGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    ctx.body = await dataModel.makeCustomFields(DisplayScope.LIST)
  })
})

factory.prepare(ModelFieldApis.DataModelDetailCustomFieldsGet, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    ctx.body = await dataModel.makeCustomFields(DisplayScope.DETAIL)
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

factory.prepare(ModelFieldApis.DataModelFieldCreate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    const { fieldType } = ctx.request.body
    assert.ok(fieldType !== FieldType.Enum, `「数值枚举」类型字段已被废弃，请使用「文本枚举」替代`)
    assert.ok(fieldType !== FieldType.Tags, `「标签」类型字段已被废弃，请使用「多选枚举」替代`)
    const field = await dataModel.createField(ctx.request.body)
    ctx.body = field.modelForClient()
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

factory.prepare(ModelFieldApis.DataModelSystemFieldsShow, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const { fieldKeys } = ctx.request.body
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    await dataModel.showSystemFields(fieldKeys)
    ctx.status = 200
  })
})

factory.prepare(ModelFieldApis.DataModelBroadcastUpdate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handle(async (dataModel) => {
    const { fieldKeys } = ctx.request.body
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    await dataModel.updateBroadcastFields(fieldKeys)
    const options: Partial<ModelNotifyTemplateModel> = {}
    options.content = await dataModel.generateNotifyTemplateContent()
    await dataModel.updateNotifyTemplate(options)
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

factory.prepare(ModelFieldApis.DataModelEnumFieldTransfer, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleField(async (modelField, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    assert.ok(!modelField.isSystem, '本接口不能修改系统字段')
    await dataModel.transferIntEnumToTextEnum(modelField, ctx.request.body)
    ctx.body = modelField.modelForClient()
    ctx.status = 200
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

factory.prepare(ModelFieldApis.DataModelFieldActionCreate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleField(async (modelField, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    assert.ok(!modelField.isSystem, '本接口不能修改系统字段')
    await modelField.addAction(ctx.request.body)
    ctx.status = 200
  })
})

factory.prepare(ModelFieldApis.DataModelFieldActionUpdate, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleField(async (modelField, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    assert.ok(!modelField.isSystem, '本接口不能修改系统字段')
    const action = (await _ModelFieldAction.findWithUid(ctx.params.actionId)) as _ModelFieldAction
    assert.ok(!!action, 'Action 不存在')
    await modelField.updateAction(action, ctx.request.body)
    ctx.status = 200
  })
})

factory.prepare(ModelFieldApis.DataModelFieldActionDelete, async (ctx) => {
  await new DataModelSpecHandler(ctx).handleField(async (modelField, dataModel) => {
    await new SessionChecker(ctx).assertModelAccessible(dataModel, GeneralPermission.ManageModel)
    assert.ok(!modelField.isSystem, '本接口不能修改系统字段')
    const action = (await _ModelFieldAction.findWithUid(ctx.params.actionId)) as _ModelFieldAction
    assert.ok(!!action, 'Action 不存在')
    await modelField.removeAction(action)
    ctx.status = 200
  })
})

export const ModelFieldSpecs = factory.buildSpecs()

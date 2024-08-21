import assert from '@fangcha/assert'
import { SpecFactory } from '@fangcha/router'
import { AuthModelSpecHandler } from './AuthModelSpecHandler'
import { _ModelField } from '../../../models/extensions/_ModelField'
import { ModelDataHandler } from '../../../services/ModelDataHandler'
import { OpenDataAppApis } from '@fangcha/datawich-service'
import { OpenSession } from '../../../services/OpenSession'

const factory = new SpecFactory('Data App', { skipAuth: true })

factory.prepare(OpenDataAppApis.DataModelInfoGet, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    ctx.body = await dataModel.modelForClient()
  })
})

factory.prepare(OpenDataAppApis.ModelFieldListGet, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    const fields = await _ModelField.fieldsForModelKey(dataModel.modelKey)
    ctx.body = fields.map((field) => field.modelForClient())
  })
})

factory.prepare(OpenDataAppApis.ModelVisibleFieldListGet, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    ctx.body = await dataModel.getExpandedFields()
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordPageDataSearch, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    const options = { ...ctx.request.body }
    const session = ctx.session as OpenSession
    options['relatedUser'] = session.curUserStr()
    ctx.body = await new ModelDataHandler(dataModel).getPageResult(options)
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordPageDataGet, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    const options = { ...ctx.request.query }
    const session = ctx.session as OpenSession
    options['relatedUser'] = session.curUserStr()
    ctx.body = await new ModelDataHandler(dataModel).getPageResult(options)
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordCreate, async (ctx) => {
  const session = ctx.session as OpenSession
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    assert.ok(!!dataModel.isDataInsertable, '此模型数据不支持添加')
    const customData = ctx.request.body
    const dataHandler = new ModelDataHandler(dataModel)
    dataHandler.setOperator(session.curUserStr())
    const dataInfo = await dataHandler.createData(customData)
    ctx.body = await dataHandler.findDataWithDataId(dataInfo.dataId)
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordForcePut, async (ctx) => {
  const session = ctx.session as OpenSession
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    assert.ok(!session.usingWebSDK, 'WebSDK can not invoke the method')
    assert.ok(!!dataModel.isDataInsertable, '此模型数据不支持添加')
    assert.ok(!!dataModel.isDataModifiable, '此模型数据不支持修改')
    const customData = ctx.request.body
    const dataHandler = new ModelDataHandler(dataModel)
    dataHandler.setOperator(session.curUserStr())
    const dataInfo = await dataHandler.forcePutData(customData)
    ctx.body = await dataHandler.findDataWithDataId(dataInfo.dataId)
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordsBatchUpsert, async (ctx) => {
  const session = ctx.session as OpenSession
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    assert.ok(!session.usingWebSDK, 'WebSDK can not invoke the method')
    assert.ok(!!dataModel.isDataInsertable, '此模型数据不支持添加')
    const dataList = ctx.request.body
    assert.ok(Array.isArray(dataList), '数据不合法，Body 应为 Array 类型')
    const dataHandler = new ModelDataHandler(dataModel)
    dataHandler.setOperator(session.curUserStr())
    await dataHandler.upsertMultipleData(dataList)
    ctx.status = 200
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordGet, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handleDataInfo(async (dataInfo, dataModel) => {
    const dataHandler = new ModelDataHandler(dataModel)
    ctx.body = await dataHandler.findDataWithDataId(dataInfo.dataId)
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordFavorAdd, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handleDataInfo(async (dataInfo, dataModel) => {
    const dataHandler = new ModelDataHandler(dataModel)
    const session = ctx.session as OpenSession
    dataHandler.setOperator(session.curUserStr())
    await dataHandler.markDataFavored(dataInfo.dataId)
    ctx.status = 200
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordFavorDelete, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handleDataInfo(async (dataInfo, dataModel) => {
    const dataHandler = new ModelDataHandler(dataModel)
    const session = ctx.session as OpenSession
    dataHandler.setOperator(session.curUserStr())
    await dataHandler.removeDataFavored(dataInfo.dataId)
    ctx.status = 200
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordUpdate, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handleDataInfo(async (dataInfo, dataModel) => {
    const session = ctx.session as OpenSession
    assert.ok(!!dataModel.isDataModifiable, '此模型数据不支持修改')
    const options = ctx.request.body
    const dataHandler = new ModelDataHandler(dataModel)
    dataHandler.setOperator(session.curUserStr())
    await dataHandler.modifyModelData(dataInfo, options)
    ctx.body = await dataHandler.findDataWithDataId(dataInfo.dataId)
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordDelete, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handleDataInfo(async (dataInfo, dataModel) => {
    assert.ok(!!dataModel.isDataDeletable, '此模型数据不支持删除')
    assert.ok(!!dataInfo, `数据[${ctx.params.dataId}]不存在`, 404)
    await dataInfo.deleteFromDB()
    ctx.status = 200
  })
})

factory.prepare(OpenDataAppApis.ModelDataInfoGet, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    assert.ok(!!ctx.params.uniqueFieldKey, 'uniqueFieldKey 不合法')
    assert.ok(!!ctx.params.fieldValue, 'fieldValue 不合法')
    const data = (await dataModel.findData(ctx.params.uniqueFieldKey, ctx.params.fieldValue))!
    assert.ok(!!data, '数据不存在', 404)
    const dataHandler = new ModelDataHandler(dataModel)
    ctx.body = await dataHandler.findDataWithDataId(data['_data_id'])
  })
})

factory.prepare(OpenDataAppApis.ModelDataExistsCheck, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    assert.ok(!!ctx.params.uniqueFieldKey, 'uniqueFieldKey 不合法')
    assert.ok(!!ctx.params.fieldValue, 'fieldValue 不合法')
    const data = (await dataModel.findData(ctx.params.uniqueFieldKey, ctx.params.fieldValue))!
    ctx.body = {
      result: !!data,
    }
  })
})

factory.prepare(OpenDataAppApis.FullModelDataInfoGet, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    ctx.body = await new ModelDataHandler(dataModel).getFullDataInfo(ctx.params)
  })
})

export const OpenDataAppSpecs = factory.buildSpecs()

import assert from '@fangcha/assert'
import { SpecFactory } from '@fangcha/router'
import { OpenDataAppApis } from '@web/datawich-common/open-api'
import { AuthModelSpecHandler } from './AuthModelSpecHandler'
import { _ModelField } from '../../../models/extensions/_ModelField'
import { ModelDataHandler } from '../../../services/ModelDataHandler'
import { ModelDataInfo } from '../../../services/ModelDataInfo'
import { FangchaSession } from '@fangcha/router/lib/session'

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

factory.prepare(OpenDataAppApis.DataAppRecordPageDataSearch, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    const options = { ...ctx.request.body }
    ctx.body = await new ModelDataHandler(dataModel).getListData(options)
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordPageDataGet, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    const options = { ...ctx.request.query }
    ctx.body = await new ModelDataHandler(dataModel).getListData(options)
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordCreate, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    assert.ok(!!dataModel.isDataInsertable, '此模型数据不支持添加')
    const customData = ctx.request.body
    const dataHandler = new ModelDataHandler(dataModel)
    dataHandler.setOperator(session.curUserStr())
    const dataInfo = await dataHandler.createData(customData)
    ctx.body = await dataHandler.findDataWithDataId(dataInfo.dataId)
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordsBatch, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    assert.ok(!!dataModel.isDataInsertable, '此模型数据不支持添加')
    const dataList = ctx.request.body
    assert.ok(Array.isArray(dataList), '数据不合法，Body 应为 Array 类型')
    const dataHandler = new ModelDataHandler(dataModel)
    dataHandler.setOperator(session.curUserStr())
    await dataHandler.createMultipleData(dataList)
    ctx.status = 200
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordUpdate, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    const session = ctx.session as FangchaSession
    assert.ok(!!dataModel.isDataModifiable, '此模型数据不支持修改')
    const dataInfo = (await ModelDataInfo.findDataInfo(dataModel, ctx.params.dataId))!
    assert.ok(!!dataInfo, `数据[${ctx.params.dataId}]不存在`, 404)
    const options = ctx.request.body
    await new ModelDataHandler(dataModel).modifyModelData(dataInfo, options, session.curUserStr())
    ctx.status = 200
  })
})

factory.prepare(OpenDataAppApis.DataAppRecordDelete, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    assert.ok(!!dataModel.isDataDeletable, '此模型数据不支持删除')
    const dataInfo = (await ModelDataInfo.findDataInfo(dataModel, ctx.params.dataId))!
    assert.ok(!!dataInfo, `数据[${ctx.params.dataId}]不存在`, 404)
    await dataInfo.deleteFromDB()
    ctx.status = 200
  })
})

factory.prepare(OpenDataAppApis.ModelDataInfoGet, async (ctx) => {
  await new AuthModelSpecHandler(ctx).handle(async (dataModel) => {
    assert.ok(!!ctx.params.uniqueFieldKey, 'uniqueFieldKey 不合法')
    assert.ok(!!ctx.params.fieldValue, 'fieldValue 不合法')
    const data = await dataModel.findData(ctx.params.uniqueFieldKey, ctx.params.fieldValue)
    assert.ok(!!data, '数据不存在', 404)
    ctx.body = data
  })
})

export const OpenDataAppSpecs = factory.buildSpecs()

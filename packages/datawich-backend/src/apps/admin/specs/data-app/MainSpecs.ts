import assert from '@fangcha/assert'
import { SpecFactory } from '@fangcha/router'
import { _OSSResource } from '@fangcha/oss-service'
import { DataAppApis } from '@web/datawich-common/web-api'
import { _DataModel } from '../../../../models/extensions/_DataModel'
import { FangchaSession } from '@fangcha/router/lib/session'
import { _CommonProfile } from '../../../../models/extensions/_CommonProfile'
import { DataAppSpecHandler } from '../handlers/DataAppSpecHandler'
import { ModelDataHandler } from '../../../../services/ModelDataHandler'
import { _ModelField } from '../../../../models/extensions/_ModelField'
import { _FieldLink } from '../../../../models/extensions/_FieldLink'
import { ModelDataInfo } from '../../../../services/ModelDataInfo'
import { SessionChecker } from '../../../../services/SessionChecker'
import { _ModelFieldAction } from '../../../../models/extensions/_ModelFieldAction'
import { DataImportHandler } from '../../../../services/DataImportHandler'
import { _DatawichService } from '../../../../services/_DatawichService'
import { GeneralPermission, ProfileEvent } from '@web/datawich-common/models'

const factory = new SpecFactory('数据应用（常规）')

factory.prepare(DataAppApis.DataAppListGet, async (ctx) => {
  const options = {
    isOnline: 1,
    _sortKey: 'create_time',
    _sortDirection: 'ASC',
    ...ctx.request.query,
  }
  const searcher = new _DataModel().fc_searcher(options)
  const feeds = await searcher.queryFeeds()
  ctx.body = feeds.map((feed) => feed.fc_pureModel())
})

factory.prepare(DataAppApis.FavorDataAppListGet, async (ctx) => {
  const session = ctx.session as FangchaSession
  const profile = await _CommonProfile.makeProfile(session.curUserStr(), ProfileEvent.UserModelSidebarApps, 'stuff')
  const profileData = profile.profileData()
  const favorModelKeys: string[] = profileData['favorModelKeys'] || []
  const searcher = new _DataModel().fc_searcher({})
  searcher.processor().addConditionKeyInArray('model_key', favorModelKeys)
  const feeds = await searcher.queryFeeds()
  ctx.body = feeds.map((feed) => feed.fc_pureModel())
})

factory.prepare(DataAppApis.DataAppRecordListGet, async (ctx) => {
  await new DataAppSpecHandler(ctx).handleDataSearch(async (dataModel, options) => {
    const handler = new ModelDataHandler(dataModel)
    const result = await handler.getListData(options)
    const summaryInfo = await handler.dataSummaryInfo(options)
    if (summaryInfo) {
      result['summaryInfo'] = summaryInfo
    }
    ctx.body = result
  })
})

factory.prepare(DataAppApis.DataAppFieldInfosSearch, async (ctx) => {
  await new DataAppSpecHandler(ctx).handle(async (dataModel) => {
    const modelField = await _ModelField.findModelField(dataModel.modelKey, ctx.params.fieldKey)
    assert.ok(!!modelField, 'ModelField Not Found')
    const { keywords = '' } = ctx.request.query
    ctx.body = await new ModelDataHandler(dataModel).searchDistinctInfos(modelField, keywords as string)
  })
})

factory.prepare(DataAppApis.DataAppFieldLinkInfosSearch, async (ctx) => {
  await new DataAppSpecHandler(ctx).handle(async (mainModel) => {
    const { keywords = '' } = ctx.request.query
    const fieldLink = await _FieldLink.findLink(ctx.params.linkId)
    assert.ok(!!fieldLink, 'FieldLink Not Found')
    assert.ok(fieldLink.modelKey === mainModel.modelKey, 'FieldLink.modelKey 有误')
    const modelField = await _ModelField.findModelField(fieldLink.refModel, fieldLink.refField)
    assert.ok(!!modelField, 'ModelField Not Found')
    const dataModel = await _DataModel.findModel(fieldLink.refModel)
    ctx.body = await new ModelDataHandler(dataModel).searchInfosWithUniqueField(modelField, keywords as string)
  })
})

factory.prepare(DataAppApis.DataAppRecordCreate, async (ctx) => {
  await new DataAppSpecHandler(ctx).handle(async (dataModel) => {
    const session = ctx.session as FangchaSession
    assert.ok(!!dataModel.isDataInsertable, '此模型数据不支持添加')
    const customData = ctx.request.body
    const dataHandler = new ModelDataHandler(dataModel)
    dataHandler.setOperator(session.curUserStr())
    const dataInfo = await dataHandler.createData(customData)
    if (!ctx.request.query.forBatch) {
      for (const plugin of _DatawichService.plugins.filter((item) => item.onDataRecordCreated)) {
        await plugin.onDataRecordCreated!(dataInfo)
      }
    }
    ctx.body = await dataHandler.findDataWithDataId(dataInfo.dataId)
  })
})

factory.prepare(DataAppApis.DataAppRecordPut, async (ctx) => {
  await new DataAppSpecHandler(ctx).handle(async (dataModel) => {
    const session = ctx.session as FangchaSession
    assert.ok(!!dataModel.isDataInsertable, '此模型数据不支持添加')
    assert.ok(!!dataModel.isDataModifiable, '此模型数据不支持修改')
    const customData = ctx.request.body
    const { rid } = customData
    if (rid) {
      const dataInfo = (await ModelDataInfo.findWithRid(dataModel, rid))!
      assert.ok(!!dataInfo, '数据不存在')
      const sessionChecker = new SessionChecker(ctx)
      if (!(await sessionChecker.checkModelPermission(dataModel, GeneralPermission.AccessOthersData))) {
        assert.ok(
          await new ModelDataHandler(dataModel).checkDataAccessible(sessionChecker.email, dataInfo.dataId),
          `您没有查看/编辑本条数据的权限 [${dataInfo.dataId}]`,
          403
        )
      }
      await new ModelDataHandler(dataModel).modifyModelData(dataInfo, customData, session.curUserStr())
      ctx.status = 200
    } else {
      const dataHandler = new ModelDataHandler(dataModel)
      dataHandler.setOperator(session.curUserStr())
      const dataInfo = await dataHandler.createData(customData)
      ctx.body = await dataHandler.findDataWithDataId(dataInfo.dataId)
    }
  })
})

factory.prepare(DataAppApis.DataAppRecordUpdate, async (ctx) => {
  await new DataAppSpecHandler(ctx).handleDataInfo(async (dataInfo, dataModel) => {
    const session = ctx.session as FangchaSession
    assert.ok(!!dataModel.isDataModifiable, '此模型数据不支持修改')
    const options = ctx.request.body
    await new ModelDataHandler(dataModel).modifyModelData(dataInfo, options, session.curUserStr())
    for (const plugin of _DatawichService.plugins.filter((item) => item.onDataRecordUpdated)) {
      await plugin.onDataRecordUpdated!(dataInfo)
    }
    ctx.status = 200
  })
})

factory.prepare(DataAppApis.DataAppRecordDelete, async (ctx) => {
  await new DataAppSpecHandler(ctx).handleDataInfo(async (dataInfo, dataModel) => {
    assert.ok(!!dataModel.isDataDeletable, '此模型数据不支持删除')
    await dataInfo.deleteFromDB()
    for (const plugin of _DatawichService.plugins.filter((item) => item.onDataRecordDeleted)) {
      await plugin.onDataRecordDeleted!(dataInfo)
    }
    ctx.status = 200
  })
})

factory.prepare(DataAppApis.DataAppRecordInfosGet, async (ctx) => {
  await new DataAppSpecHandler(ctx).handleDataInfo(async (dataInfo) => {
    ctx.body = await new ModelDataHandler(dataInfo.dataModel).makeReadableInfosForClient(dataInfo)
    ctx.status = 200
  })
})

factory.prepare(DataAppApis.DataAppRecordActionPerformerGet, async (ctx) => {
  await new DataAppSpecHandler(ctx).handleDataInfo(async (dataInfo) => {
    const action = (await _ModelFieldAction.findWithUid(ctx.params.actionId)) as _ModelFieldAction
    assert.ok(!!action, '动作不存在')
    assert.ok(action.modelKey === dataInfo.dataModel.modelKey, '动作与数据模型不匹配')
    ctx.body = await dataInfo.actionPerformerInfos(action, ctx.params.fieldKey)
  })
})

factory.prepare(DataAppApis.DataAppExcelDemoDownload, async (ctx) => {
  await new DataAppSpecHandler(ctx).handle(async (dataModel) => {
    const filename = `${dataModel.modelKey}-demo.xlsx`
    ctx.set('Content-disposition', `attachment; filename=${filename}`)
    ctx.body = await new DataImportHandler(dataModel).exportDemoExcel()
    ctx.status = 200
  })
})

factory.prepare(DataAppApis.DataAppPendingListGet, async (ctx) => {
  await new DataAppSpecHandler(ctx).handle(async (dataModel) => {
    const resource = (await _OSSResource.findWithUid(ctx.params.resourceId))!
    assert.ok(!!resource, 'Resource Not Found')
    ctx.body = await new DataImportHandler(dataModel).extractRecordsFromResource(resource)
    ctx.status = 200
  })
})

export const MainSpecs = factory.buildSpecs()

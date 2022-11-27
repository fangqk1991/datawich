import { SpecFactory } from '@fangcha/router'
import * as moment from 'moment'
import { OSSService, ResourceTaskHandler } from '@fangcha/oss-service'
import { FangchaSession } from '@fangcha/router/lib/session'
import { DataAppRecordsXlsExportTask } from '../../../services/tasks/DataAppRecordsXlsExportTask'
import { DataAppApis } from '@web/datawich-common/web-api'
import { DataAppSpecHandler } from './handlers/DataAppSpecHandler'

const factory = new SpecFactory('数据应用（常规）')

factory.prepare(DataAppApis.DataAppExcelExport, async (ctx) => {
  await new DataAppSpecHandler(ctx).handleDataSearch(async (dataModel, options) => {
    const session = ctx.session as FangchaSession
    const task = new DataAppRecordsXlsExportTask({
      modelKey: dataModel.modelKey,
      options: options,
      _userEmail: session.curUserStr(),
      _time: `${moment().valueOf()}`,
    })
    const handler = new ResourceTaskHandler(task)
    if (await task.checkTaskMini()) {
      await handler.executeTask()
    } else {
      await handler.submitTask()
    }
    const resourceTask = await handler.prepareTask()
    ctx.body = OSSService.fillDownloadUrl(resourceTask.modelForClient())
  })
})

factory.prepare(DataAppApis.DataAppRecordsImportedCallback, async (ctx) => {
  // const { succCount } = ctx.request.body
  // const dataModel = await prepareDataApp(ctx)
  // if (dataModel.isBroadcast) {
  //   GeneralDataAlert.sendMessage(
  //     dataModel.channelName(),
  //     `${dataModel.name}，导入了 ${succCount} 条数据: ${GeneralDataService.getModelPageURL(dataModel.modelKey)}`
  //   )
  // }
  ctx.status = 200
})

export const DatawichDataAppSpecs = factory.buildSpecs()

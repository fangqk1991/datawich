import { _OSSResource, OSSService, TaskHandlerProtocol } from '@fangcha/oss-service'
import { ResourceTaskParams } from '@fangcha/oss-service/lib/common/models'
import { BackendFile } from '@fangcha/tools/lib/file-backend'
import { DatawichResque } from '../DatawichResque'
import { _DataModel } from '../../models/extensions/_DataModel'
import { ModelDataHandler } from '../ModelDataHandler'

interface DataAppParams {
  modelKey: string
  options: {}
  _userEmail: string
  _time: string
}

export class DataAppRecordsXlsExportTask implements TaskHandlerProtocol {
  params: ResourceTaskParams

  constructor(rawParams: DataAppParams) {
    this.params = {
      userEmail: rawParams._userEmail,
      taskType: 'DataAppRecordsXlsExportTask',
      rawParams: rawParams,
      fileName: `Model_${rawParams.modelKey}_${rawParams._time}.xlsx`,
    }
  }

  public async private_submitTask(taskKey: string) {
    await DatawichResque.requestResourceHandleTask(taskKey)
  }

  public async checkTaskMini() {
    const rawParams = this.params.rawParams as DataAppParams
    const options = rawParams.options
    const dataModel = await _DataModel.findModel(rawParams.modelKey)
    const fields = await dataModel.getFields()
    const count = await new ModelDataHandler(dataModel).getDataCount(options)
    return fields.length <= 20 && count <= 1000
  }

  public async private_executeTask() {
    const rawParams = this.params.rawParams as DataAppParams
    const options = rawParams.options
    const dataModel = await _DataModel.findModel(rawParams.modelKey)
    const downloader = OSSService.getDownloader()
    const ossTools = OSSService.getTools('fc-web-oss')
    const tmpPath = await new ModelDataHandler(dataModel).exportDataExcel(options)

    const file = downloader.saveTmpFile(tmpPath)
    const filePath = file.filePath()

    const fileExt = BackendFile.getFileExt(filePath)
    const ossKey = await ossTools.ossUtils.autoUpload(filePath, fileExt)

    return await _OSSResource.generateOSSResource({
      bucketName: 'fc-web-oss',
      ossKey: ossKey,
      size: BackendFile.getFileSize(filePath),
      uploader: rawParams._userEmail || '',
      mimeType: BackendFile.getFileMime(filePath),
    })
  }
}

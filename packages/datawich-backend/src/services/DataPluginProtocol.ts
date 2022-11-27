import { _DataModel } from '../models/extensions/_DataModel'
import { ModelDataInfo } from './ModelDataInfo'

export interface DataPluginProtocol {
  onDataFound?: (data: any, dataModel: _DataModel) => Promise<void>
  onParamsCheck?: (params: any, dataModel: _DataModel) => Promise<{ [p: string]: string }> // return errorMap

  onDataRecordCreated?: (data: ModelDataInfo) => Promise<void>
  onDataRecordUpdated?: (data: ModelDataInfo) => Promise<void>
  onDataRecordDeleted?: (data: ModelDataInfo) => Promise<void>
}

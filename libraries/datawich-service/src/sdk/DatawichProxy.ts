import { CommonAPI } from '@fangcha/app-request'
import { OpenDataAppApis, OpenDataModelApis } from '../common/open-api'
import { ModelFullMetadata, ModelMilestoneModel } from '../common/models'
import { BasicAuthConfig, PageResult } from '@fangcha/tools'
import { BasicAuthProxy, RequestFollower } from '@fangcha/app-request-extensions'
import { FilterOptions } from 'fc-feed'

export class DatawichProxy extends BasicAuthProxy {
  public constructor(config: BasicAuthConfig, observerClass?: { new (requestId?: string): RequestFollower }) {
    super(config, observerClass)
  }

  public baseURL() {
    return this._config.urlBase
  }

  public async getGeneralDataModelMasterMetadata(modelKey: string) {
    const request = this.makeRequest(new CommonAPI(OpenDataModelApis.ModelMasterMetadataGet, modelKey))
    return (await request.quickSend()) as ModelFullMetadata
  }

  public async getGeneralDataModelVersions(modelKey: string) {
    const request = this.makeRequest(new CommonAPI(OpenDataModelApis.ModelTagListGet, modelKey))
    return (await request.quickSend()) as ModelMilestoneModel[]
  }

  public async getGeneralDataModelTagMetadata(modelKey: string, tagName: string) {
    const request = this.makeRequest(new CommonAPI(OpenDataModelApis.ModelTagMetadataGet, modelKey, tagName))
    return (await request.quickSend()) as ModelFullMetadata
  }

  public async getRecordInfo<T = any>(modelKey: string, uniqueKey: string, value: string) {
    const request = this.makeRequest(new CommonAPI(OpenDataAppApis.ModelDataInfoGet, modelKey, uniqueKey, value))
    return (await request.quickSend()) as T
  }

  public async checkRecordExists(modelKey: string, uniqueKey: string, value: string) {
    const request = this.makeRequest(new CommonAPI(OpenDataAppApis.ModelDataExistsCheck, modelKey, uniqueKey, value))
    const { result } = await request.quickSend<{ result: boolean }>()
    return result
  }

  public async getPageResult<T = any>(modelKey: string, params: FilterOptions = {}) {
    const request = this.makeRequest(new CommonAPI(OpenDataAppApis.DataAppRecordPageDataGetV2, modelKey))
    request.setQueryParams(params)
    return await request.quickSend<PageResult<T>>()
  }

  public async createRecord<T = any>(modelKey: string, bodyData: Partial<T>) {
    const request = this.makeRequest(new CommonAPI(OpenDataAppApis.DataAppRecordForcePut, modelKey))
    request.setBodyData(bodyData)
    return (await request.quickSend()) as T
  }

  public async updateRecord<T = any>(modelKey: string, dataId: string, bodyData: T) {
    const request = this.makeRequest(new CommonAPI(OpenDataAppApis.DataAppRecordUpdate, modelKey, dataId))
    request.setBodyData(bodyData)
    return (await request.quickSend()) as T
  }

  public async deleteRecord(modelKey: string, dataId: string) {
    const request = this.makeRequest(new CommonAPI(OpenDataAppApis.DataAppRecordDelete, modelKey, dataId))
    return await request.quickSend()
  }

  public async createBatchRecords(modelKey: string, dataList: any[]) {
    const request = this.makeRequest(new CommonAPI(OpenDataAppApis.DataAppRecordsBatchUpsert, modelKey))
    request.setBodyData(dataList)
    await request.quickSend()
  }
}

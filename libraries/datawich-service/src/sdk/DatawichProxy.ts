import { CommonAPI } from '@fangcha/app-request'
import { BasicAuthProxy, RequestFollower } from '@fangcha/tools/lib/request'
import { OpenDataModelApis } from '../common/open-api'
import { ModelFullMetadata, ModelMilestoneModel } from '../common/models'
import { BasicAuthConfig } from '@fangcha/tools'

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
}

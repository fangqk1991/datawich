import { DataModelModel, ModelFullMetadata, ModelMilestoneModel } from '@fangcha/datawich-service'
import { MyAxios } from '@fangcha/vue/basic'
import { CommonAPI } from '@fangcha/app-request'
import { SdkDatawichApis } from '@fangcha/datawich-service'

export class DatawichHTTP {
  public static async getModelList(keywords: string): Promise<DataModelModel[]> {
    const request = MyAxios(SdkDatawichApis.ModelListGet)
    request.setQueryParams({
      keywords: keywords,
    })
    return request.quickSend()
  }

  public static async getModelVersionList(modelKey: string): Promise<ModelMilestoneModel[]> {
    const request = MyAxios(new CommonAPI(SdkDatawichApis.ModelTagListGet, modelKey))
    return request.quickSend()
  }

  public static async getModelTagMetadata(modelKey: string, version: string): Promise<ModelFullMetadata> {
    const request = MyAxios(new CommonAPI(SdkDatawichApis.ModelTagMetadataGet, modelKey, version))
    return request.quickSend()
  }
}

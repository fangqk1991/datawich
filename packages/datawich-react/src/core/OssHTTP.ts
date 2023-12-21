import { CommonAPI } from '@fangcha/app-request'
import { OssApis, OSSResourceModel, OssTypicalParams, ResourceMetadata } from '@fangcha/oss-models'
import { MyRequest } from '@fangcha/auth-react'

export class OssHTTP {
  public static async getOssResourceMetadata(params: OssTypicalParams): Promise<ResourceMetadata> {
    const request = MyRequest(new CommonAPI(OssApis.OssResourcePrepare, params.bucketName, params.ossZone))
    request.setBodyData(params)
    return request.quickSend()
  }

  public static async markOssResourceSuccess(resourceId: string): Promise<OSSResourceModel> {
    const request = MyRequest(new CommonAPI(OssApis.OssResourceStatusMark, resourceId))
    return await request.quickSend()
  }
}

import { SpecFactory } from '@fangcha/router'
import { OpenOssApis } from '@fangcha/datawich-service'
import { OpenSession } from '../../../services/OpenSession'
import { OSSService } from '@fangcha/oss-service'

const factory = new SpecFactory('上传文件')

factory.prepare(OpenOssApis.OssResourcePrepare, async (ctx) => {
  const session = ctx.session as OpenSession
  ctx.body = await OSSService.makeOssResourceMetadata(ctx.request.body, session.realUserId)
})

factory.prepare(OpenOssApis.OssResourceStatusMark, async (ctx) => {
  ctx.body = await OSSService.markResourceSucc(ctx.params.resourceId)
})

export const OpenOssSpecs = factory.buildSpecs()

import { SpecFactory } from '@fangcha/router'
import assert from '@fangcha/assert'
import { FangchaSession } from '@fangcha/session'
import { SdkDatawichApis } from '@fangcha/datawich-service'
import { DatawichService } from '../sdk'

const datawichProxyForSession = (session: FangchaSession) => {
  assert.ok(!!DatawichService.proxy, 'proxy 未初始化', 500)
  return DatawichService.proxy.proxyForSession(session.reqid)
}

const factory = new SpecFactory('Datawich SDK 相关', {
  skipAuth: true,
})

Object.values(SdkDatawichApis).forEach((api) => {
  factory.prepare(api, async (ctx) => {
    const path = ctx.request.path.replace(/^\/api\/datawich-sdk\//, '/api/')
    const request = datawichProxyForSession(ctx.session).makeRequest({
      method: ctx.request.method,
      api: path,
      description: api.description,
    })
    request.setQueryParams(ctx.request.query)
    if (ctx.request.method !== 'GET') {
      request.setBodyData(ctx.request.body)
    }
    const session = ctx.session as FangchaSession
    request.addHeader('x-web-sdk', '1')
    request.addHeader('x-datawich-visitor', session.curUserStr())
    ctx.body = await request.quickSend()
    ctx.status = 200
  })
})

export const SdkDatawichSpecs = factory.buildSpecs()

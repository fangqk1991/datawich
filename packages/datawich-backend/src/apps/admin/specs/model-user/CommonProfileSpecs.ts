import assert from '@fangcha/assert'
import { SpecFactory } from '@fangcha/router'
import { Context } from 'koa'
import { FangchaSession } from '@fangcha/session'
import { _CommonProfile } from '../../../../models/extensions/_CommonProfile'
import { CommonProfileApis } from '@web/datawich-common/admin-apis'
import { ProfileEventDescriptor } from '@web/datawich-common/models'

const prepareProfile = async (ctx: Context) => {
  const event = ctx.params.event
  const target = ctx.params.target
  const session = ctx.session as FangchaSession
  assert.ok(ProfileEventDescriptor.checkValueValid(event), 'Event 不合法')
  return _CommonProfile.makeProfile(session.curUserStr(), event, target)
}

const factory = new SpecFactory('通用配置')

factory.prepare(CommonProfileApis.ProfileInfoGet, async (ctx) => {
  const profile = await prepareProfile(ctx)
  ctx.body = profile.profileData()
})

factory.prepare(CommonProfileApis.ProfileUserInfoUpdate, async (ctx) => {
  const params = ctx.request.body
  const profile = await prepareProfile(ctx)
  await profile.updateProfile(params)
  ctx.body = profile.profileData()
})

export const CommonProfileSpecs = factory.buildSpecs()

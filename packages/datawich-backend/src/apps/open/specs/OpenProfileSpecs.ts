import assert from '@fangcha/assert'
import { SpecFactory } from '@fangcha/router'
import { Context } from 'koa'
import { OpenProfileApis, ProfileEventDescriptor } from '@fangcha/datawich-service'
import { _CommonProfile } from '../../../models/extensions/_CommonProfile'
import { OpenSession } from '../../../services/OpenSession'

const prepareProfile = async (ctx: Context) => {
  const event = ctx.params.event
  const target = ctx.params.target
  const session = ctx.session as OpenSession
  assert.ok(ProfileEventDescriptor.checkValueValid(event), 'Event 不合法')
  return _CommonProfile.makeProfile(session.realUserId, event, target)
}

const factory = new SpecFactory('通用配置')

factory.prepare(OpenProfileApis.ProfileInfoGet, async (ctx) => {
  const profile = await prepareProfile(ctx)
  ctx.body = profile.profileData()
})

factory.prepare(OpenProfileApis.ProfileUserInfoUpdate, async (ctx) => {
  const params = ctx.request.body
  const profile = await prepareProfile(ctx)
  await profile.updateProfile(params)
  ctx.body = profile.profileData()
})

export const OpenProfileSpecs = factory.buildSpecs()

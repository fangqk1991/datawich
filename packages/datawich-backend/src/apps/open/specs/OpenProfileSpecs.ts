import assert from '@fangcha/assert'
import { SpecFactory } from '@fangcha/router'
import { Context } from 'koa'
import { OpenProfileApis, ProfileEvent, ProfileEventDescriptor } from '@fangcha/datawich-service'
import { _CommonProfile } from '../../../models/extensions/_CommonProfile'
import { OpenSession } from '../../../services/OpenSession'
import { _DataModel } from '../../../models/extensions/_DataModel'

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

factory.prepare(OpenProfileApis.FavorDataAppListGet, async (ctx) => {
  const session = ctx.session as OpenSession
  const profile = await _CommonProfile.makeProfile(session.realUserId, ProfileEvent.UserModelSidebarApps, 'stuff')
  const profileData = profile.profileData()
  const favorModelKeys: string[] = profileData['favorModelKeys'] || []
  const searcher = new _DataModel().fc_searcher({})
  searcher.processor().addConditionKeyInArray('model_key', favorModelKeys)
  const feeds = await searcher.queryFeeds()
  ctx.body = feeds.map((feed) => feed.modelForClient())
})

export const OpenProfileSpecs = factory.buildSpecs()

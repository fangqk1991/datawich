import { SpecFactory } from '@fangcha/router'
import assert from '@fangcha/assert'
import { GeneralModelSpaces, GroupSpace } from '@fangcha/general-group'
import { ModelUserApis } from '@web/datawich-common/web-api'
import { _DatawichService } from '../../../../services/_DatawichService'
import { FangchaSession } from '@fangcha/router/lib/session'
import { CommonGroupSpecHandler } from '../handlers/CommonGroupSpecHandler'
import { GeneralDataPermissionKey } from '@web/datawich-common/models'

const factory = new SpecFactory('模型用户组')

factory.prepare(ModelUserApis.ModelUserGroupListGet, async (ctx) => {
  const searcher = _DatawichService.groupApp.groupSearcher(GeneralModelSpaces).makeSearcher(ctx.request.query)
  const feeds = await searcher.queryFeeds()
  ctx.body = {
    elements: feeds.map((feed) => feed.fc_pureModel()),
    totalSize: await searcher.queryCount(),
  }
})

factory.prepare(ModelUserApis.ModelUserGroupCreate, async (ctx) => {
  const session = ctx.session as FangchaSession
  session.assertVisitorHasPermission(GeneralDataPermissionKey.PERMISSION_GENERAL_DATA_MANAGEMENT)
  const { name, objKey } = ctx.request.body
  assert.ok(!!name, '组名不能为空')
  const builder = _DatawichService.groupApp
    .groupBuilder(GroupSpace.ModelCustomGroup, session.curUserStr())
    .setName(name)
  if (objKey) {
    builder.setObjKey(objKey)
  }
  const group = await builder.build()
  ctx.body = group.fc_pureModel()
})

factory.prepare(ModelUserApis.ModelUserGroupDelete, async (ctx) => {
  await new CommonGroupSpecHandler(ctx).handle(async (group) => {
    assert.ok(group.space !== GroupSpace.ModelRetainGroup, '保留组不可删除')
    await group.destroyGroup()
    ctx.status = 200
  })
})

factory.prepare(ModelUserApis.ModelUserGroupPermissionUpdate, async (ctx) => {
  await new CommonGroupSpecHandler(ctx).handle(async (group) => {
    assert.ok(group.space !== GroupSpace.ModelRetainGroup, '保留组权限不可修改')
    await group.updatePermissions(ctx.request.body)
    ctx.status = 200
  })
})

export const ModelUserGroupSpecs = factory.buildSpecs()

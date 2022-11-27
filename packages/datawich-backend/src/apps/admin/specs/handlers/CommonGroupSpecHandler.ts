import assert from '@fangcha/assert'
import { Context } from 'koa'
import { _DatawichService } from '../../../../services/_DatawichService'
import { FangchaSession } from '@fangcha/router/lib/session'
import { GroupLevel } from '@fangcha/general-group'
import { _CommonGroup } from '@fangcha/general-group/src/models/extensions/_CommonGroup'
import { _CommonMember } from '@fangcha/general-group/src/models/extensions/_CommonMember'

export class CommonGroupSpecHandler {
  ctx!: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
  }

  private _group!: _CommonGroup
  public async prepareGroup() {
    if (!this._group) {
      const ctx = this.ctx
      const group = await _DatawichService.groupApp.findGroup(ctx.params.groupId)
      assert.ok(!!group, '用户组不存在')

      const session = ctx.session as FangchaSession
      const member = await group.findMember(session.curUserStr())
      if (!session.checkVisitorIsAdmin()) {
        if (group.groupLevel === GroupLevel.Private) {
          assert.ok(!!member, '您不在该组中，无权查看', 403)
        }
        if (ctx.method !== 'GET') {
          if (group.groupLevel !== GroupLevel.Public) {
            assert.ok(!!member, '您不在该组中，无权编辑', 403)
            assert.ok(!!member?.isAdmin, '只有管理员才能进行编辑操作', 403)
          }
        }
      }
      this._group = group as any
    }
    return this._group
  }

  public async handle(handler: (group: _CommonGroup) => Promise<void>) {
    const group = await this.prepareGroup()
    await handler(group)
  }

  public async handleMember(handler: (member: _CommonMember, group: _CommonGroup) => Promise<void>) {
    const group = await this.prepareGroup()
    const member = await group.findMember(this.ctx.params.email)
    assert.ok(!!member, '成员不存在')
    await handler(member, group)
  }
}

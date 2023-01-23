import assert from '@fangcha/assert'
import { LoopPerformer } from '@fangcha/tools'
import { _AppClient } from '../../models/extensions/_AppClient'
import { LoopPerformerHelper } from '@fangcha/backend-kit'
import { OpenVisitor } from '@fangcha/router/src/basic/OpenVisitor'

class _VisitorCenter {
  private _visitorMap: { [p: string]: OpenVisitor }

  public constructor() {
    this._visitorMap = {}
  }

  public async reloadVisitorsData() {
    const feeds = await new _AppClient().fc_searcher().queryAllFeeds()
    this._visitorMap = feeds.reduce((result, feed) => {
      result[feed.appid] = {
        visitorId: feed.appid,
        name: feed.name,
        secrets: [feed.appSecret],
        permissionKeys: [],
        isEnabled: true,
      }
      return result
    }, {} as { [p: string]: OpenVisitor })
  }

  public findVisitor(username: string, password: string) {
    const visitor = this._visitorMap[username]
    assert.ok(!!visitor, `Username(${username}) not exists.`, 401)
    assert.ok(visitor.isEnabled, `App(${visitor.name} ${visitor.visitorId}) is no longer available`, 401)
    assert.ok(visitor.secrets.includes(password), 'password error.', 401)
    return visitor
  }

  private _loopPerformer!: LoopPerformer
  public autoReloadVisitorCenter() {
    if (!this._loopPerformer) {
      this._loopPerformer = LoopPerformerHelper.makeLoopPerformer(60 * 1000)
      this._loopPerformer.execute(async () => {
        await this.reloadVisitorsData()
      })
    }
  }
}

export const VisitorCenter = new _VisitorCenter()

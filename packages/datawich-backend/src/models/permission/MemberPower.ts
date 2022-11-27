import { DBObserver, FeedBase } from 'fc-feed'
import { FCDatabase } from 'fc-sql'

interface PermissionParams {
  scope: string
  member: string
  permission?: string
  space?: string | string[]
}

export class MemberPower extends FeedBase {
  protected static _staticDatabase: FCDatabase
  protected static _staticDBObserver?: DBObserver

  public permission!: string

  public static setDatabase(database: FCDatabase, dbObserver?: DBObserver) {
    this._staticDatabase = database
    this._staticDBObserver = dbObserver
  }

  public constructor() {
    super()
    this.setDBProtocolV2({
      database: MemberPower._staticDatabase,
      table:
        'group_permission INNER JOIN common_group ON common_group.group_id = group_permission.group_id INNER JOIN group_member ON common_group.group_id = group_member.group_id',
      primaryKey: '',
      cols: ['group_permission.permission AS permission'],
      insertableCols: [],
      modifiableCols: [],
    })
  }

  public fc_propertyMapper() {
    return {
      permission: 'permission',
    }
  }

  public static makeSearcher(params: PermissionParams) {
    const searcher = new MemberPower().fc_searcher()
    searcher.processor().addConditionKV('group_member.member', params.member)
    searcher.processor().addSpecialCondition('group_permission.scope IN (?, "*")', params.scope)
    if (params.permission) {
      searcher.processor().addSpecialCondition('group_permission.permission IN (?, "*")', params.permission)
    }
    if (params.space) {
      if (Array.isArray(params.space)) {
        if (params.space.length > 0) {
          searcher.processor().addConditionKeyInSet(`common_group.space`, ...params.space)
        }
      } else {
        searcher.processor().addConditionKV('common_group.space', params.space)
      }
    }
    searcher.processor().markDistinct()
    return searcher
  }

  public static async checkPermission(params: PermissionParams) {
    const searcher = MemberPower.makeSearcher(params)
    return (await searcher.queryCount()) > 0
  }

  public static async fetchPowerData(params: PermissionParams) {
    const searcher = MemberPower.makeSearcher(params)
    const feeds = await searcher.queryAllFeeds()
    const result: { [p: string]: boolean } = {}
    feeds.forEach((feed) => {
      result[feed.permission] = true
    })
    return result
  }
}

import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'user',
  'event',
  'target',
  'description',
  'create_time',
  'update_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'user',
  'event',
  'target',
  'description',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'description',
]

const dbOptions = {
  table: 'common_profile',
  primaryKey: ['user', 'event', 'target'],
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __CommonProfile extends FeedBase {
  /**
   * @description [varchar(127)] 用户邮箱；(group_id, member) 具备唯一性
   */
  public user!: string
  /**
   * @description [varchar(63)] 事件描述项
   */
  public event!: string
  /**
   * @description [varchar(127)]
   */
  public target!: string
  /**
   * @description [text] 描述信息，空 | JSON 字符串
   */
  public description!: string
  /**
   * @description [timestamp] 创建时间
   */
  public createTime!: string
  /**
   * @description [timestamp] 更新时间
   */
  public updateTime!: string

  protected static _staticDBOptions: DBProtocolV2
  protected static _staticDBObserver?: DBObserver

  public static setDatabase(database: FCDatabase, dbObserver?: DBObserver) {
    this.addStaticOptions({ database: database }, dbObserver)
  }

  public static setStaticProtocol(protocol: Partial<DBProtocolV2>, dbObserver?: DBObserver) {
    this._staticDBOptions = Object.assign({}, dbOptions, protocol) as DBProtocolV2
    this._staticDBObserver = dbObserver
    this._onStaticDBOptionsUpdate(this._staticDBOptions)
  }

  public static addStaticOptions(protocol: Partial<DBProtocolV2>, dbObserver?: DBObserver) {
    this._staticDBOptions = Object.assign({}, dbOptions, this._staticDBOptions, protocol) as DBProtocolV2
    this._staticDBObserver = dbObserver
    this._onStaticDBOptionsUpdate(this._staticDBOptions)
  }

  public static _onStaticDBOptionsUpdate(_protocol: DBProtocolV2) {}

  public constructor() {
    super()
    this.setDBProtocolV2(this.constructor['_staticDBOptions'])
    this._reloadOnAdded = true
    this._reloadOnUpdated = true
    if (this.constructor['_staticDBObserver']) {
      this.dbObserver = this.constructor['_staticDBObserver']
    }
  }

  public fc_defaultInit() {
    // This function is invoked by constructor of FCModel
    this.target = '目标 ID'
    this.description = ''
  }

  public fc_propertyMapper() {
    return {
      user: 'user',
      event: 'event',
      target: 'target',
      description: 'description',
      createTime: 'create_time',
      updateTime: 'update_time',
    }
  }
}

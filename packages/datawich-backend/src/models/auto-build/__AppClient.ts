import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'appid',
  'app_secret',
  'name',
  'create_time',
  'update_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'appid',
  'app_secret',
  'name',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'app_secret',
  'name',
]

const dbOptions = {
  table: 'app_client',
  primaryKey: 'appid',
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __AppClient extends FeedBase {
  /**
   * @description [varchar(63)] 应用 ID，用户自定义（最好具备语义），具备唯一性
   */
  public appid!: string
  /**
   * @description [char(32)] 应用密钥
   */
  public appSecret!: string
  /**
   * @description [varchar(127)] 应用名称
   */
  public name!: string
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
    this.name = ''
  }

  public fc_propertyMapper() {
    return {
      appid: 'appid',
      appSecret: 'app_secret',
      name: 'name',
      createTime: 'create_time',
      updateTime: 'update_time',
    }
  }
}

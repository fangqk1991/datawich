import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'uid',
  'db_host',
  'db_port',
  'db_name',
  'username',
  'password',
  'created_at',
  'updated_at',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'uid',
  'db_host',
  'db_port',
  'db_name',
  'username',
  'password',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'db_host',
  'db_port',
  'db_name',
  'username',
  'password',
  'created_at',
]

const dbOptions = {
  table: 'db_connection',
  primaryKey: 'uid',
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __DBConnection extends FeedBase {
  /**
   * @description [char(32)] UUID
   */
  public uid!: string
  /**
   * @description [varchar(255)] DB Host
   */
  public dbHost!: string
  /**
   * @description [int] DB Port
   */
  public dbPort!: number
  /**
   * @description [varchar(255)] DB Name
   */
  public dbName!: string
  /**
   * @description [varchar(255)] username
   */
  public username!: string
  /**
   * @description [text] password
   */
  public password!: string
  /**
   * @description [timestamp] 创建时间
   */
  public createdAt!: string
  /**
   * @description [timestamp] 更新时间
   */
  public updatedAt!: string

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
    this.dbHost = '127.0.0.1'
    this.dbPort = 3306
    this.password = ''
  }

  public fc_propertyMapper() {
    return {
      uid: 'uid',
      dbHost: 'db_host',
      dbPort: 'db_port',
      dbName: 'db_name',
      username: 'username',
      password: 'password',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  }
}

import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'uid',
  'connection_id',
  'table_id',
  'name',
  'open_level',
  'fields_extras_str',
  'created_at',
  'updated_at',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'uid',
  'connection_id',
  'table_id',
  'name',
  'open_level',
  'fields_extras_str',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'connection_id',
  'table_id',
  'name',
  'open_level',
  'fields_extras_str',
  'created_at',
]

const dbOptions = {
  table: 'db_table_extras',
  primaryKey: 'uid',
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __DBTableExtras extends FeedBase {
  /**
   * @description [char(32)] Table UID
   */
  public uid!: string
  /**
   * @description [char(32)] Connection ID
   */
  public connectionId!: string
  /**
   * @description [varchar(255)] Table ID
   */
  public tableId!: string
  /**
   * @description [varchar(255)] Table Name
   */
  public name!: string
  /**
   * @description [enum('None','Private','Protected','Public')] 服务商
   */
  public openLevel!: string
  /**
   * @description [mediumtext] 附加信息，空 | JSON 字符串
   */
  public fieldsExtrasStr!: string
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
    this.name = ''
    this.openLevel = 'None'
    this.fieldsExtrasStr = ''
  }

  public fc_propertyMapper() {
    return {
      uid: 'uid',
      connectionId: 'connection_id',
      tableId: 'table_id',
      name: 'name',
      openLevel: 'open_level',
      fieldsExtrasStr: 'fields_extras_str',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  }
}

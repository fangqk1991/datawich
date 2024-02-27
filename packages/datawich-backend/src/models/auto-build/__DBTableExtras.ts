import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'uid',
  'connection_id',
  'table_id',
  'name',
  'fields_extras',
  'created_at',
  'updated_at',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'uid',
  'connection_id',
  'table_id',
  'name',
  'fields_extras',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'connection_id',
  'table_id',
  'name',
  'fields_extras',
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
   * @description [mediumtext] 附加信息，空 | JSON 字符串
   */
  public fieldsExtras!: string
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
    this.fieldsExtras = ''
  }

  public fc_propertyMapper() {
    return {
      uid: 'uid',
      connectionId: 'connection_id',
      tableId: 'table_id',
      name: 'name',
      fieldsExtras: 'fields_extras',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  }
}

import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'model_key',
  'record_id',
  'owner_id',
  'create_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'model_key',
  'record_id',
  'owner_id',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'model_key',
  'record_id',
  'owner_id',
  'create_time',
]

const dbOptions = {
  table: 'data_record_favor',
  primaryKey: ['model_key', 'record_id', 'owner_id'],
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __DataRecordFavor extends FeedBase {
  /**
   * @description [varchar(63)] 模型键值，SQL 外键 -> data_model.model_key
   */
  public modelKey!: string
  /**
   * @description [bigint unsigned]
   */
  public recordId!: number
  /**
   * @description [varchar(127)] 所有者
   */
  public ownerId!: string
  /**
   * @description [timestamp] 创建时间
   */
  public createTime!: string

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
    if (this.constructor['_staticDBObserver']) {
      this.dbObserver = this.constructor['_staticDBObserver']
    }
  }

  public fc_defaultInit() {
    // This function is invoked by constructor of FCModel
    this.ownerId = ''
  }

  public fc_propertyMapper() {
    return {
      modelKey: 'model_key',
      recordId: 'record_id',
      ownerId: 'owner_id',
      createTime: 'create_time',
    }
  }
}

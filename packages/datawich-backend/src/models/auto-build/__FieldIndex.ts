import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'model_key',
  'field_key',
  'is_unique',
  'create_time',
  'update_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'model_key',
  'field_key',
  'is_unique',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'is_unique',
]

const dbOptions = {
  table: 'field_index',
  primaryKey: ['model_key', 'field_key'],
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __FieldIndex extends FeedBase {
  /**
   * @description [varchar(63)] 模型键值，SQL 外键 -> model_field.model_key
   */
  public modelKey!: string
  /**
   * @description [varchar(63)] 字段键值，SQL 外键 -> model_field.field_key
   */
  public fieldKey!: string
  /**
   * @description [tinyint] 是否具备 UNIQUE 属性
   */
  public isUnique!: number
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
    this.isUnique = 0
  }

  public fc_propertyMapper() {
    return {
      modelKey: 'model_key',
      fieldKey: 'field_key',
      isUnique: 'is_unique',
      createTime: 'create_time',
      updateTime: 'update_time',
    }
  }
}

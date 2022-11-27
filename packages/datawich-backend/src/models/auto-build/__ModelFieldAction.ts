import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'action_id',
  'model_key',
  'field_key',
  'event',
  'title',
  'content',
  'create_time',
  'update_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'action_id',
  'model_key',
  'field_key',
  'event',
  'title',
  'content',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'event',
  'title',
  'content',
]

const dbOptions = {
  table: 'model_field_action',
  primaryKey: 'action_id',
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __ModelFieldAction extends FeedBase {
  /**
   * @description [varchar(63)] 动作 ID，具备唯一性
   */
  public actionId!: string
  /**
   * @description [varchar(63)] 模型键值，SQL 外键 -> model_field.model_key
   */
  public modelKey!: string
  /**
   * @description [varchar(63)] 字段键值，SQL 外键 -> model_field.field_key
   */
  public fieldKey!: string
  /**
   * @description [varchar(63)] 事件描述项
   */
  public event!: string
  /**
   * @description [varchar(127)] 描述文字
   */
  public title!: string
  /**
   * @description [varchar(1023)] 动作内容
   */
  public content!: string
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
  }

  public fc_propertyMapper() {
    return {
      actionId: 'action_id',
      modelKey: 'model_key',
      fieldKey: 'field_key',
      event: 'event',
      title: 'title',
      content: 'content',
      createTime: 'create_time',
      updateTime: 'update_time',
    }
  }
}

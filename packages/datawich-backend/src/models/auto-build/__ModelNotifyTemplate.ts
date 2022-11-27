import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'template_id',
  'model_key',
  'is_active',
  'content',
  'email_entity_str',
  'create_time',
  'update_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'template_id',
  'model_key',
  'is_active',
  'content',
  'email_entity_str',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'is_active',
  'content',
  'email_entity_str',
]

const dbOptions = {
  table: 'model_notify_template',
  primaryKey: 'template_id',
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __ModelNotifyTemplate extends FeedBase {
  /**
   * @description [varchar(63)] 模板 ID，UUID
   */
  public templateId!: string
  /**
   * @description [varchar(63)] 模型键值，SQL 外键 -> data_model.model_key
   */
  public modelKey!: string
  /**
   * @description [tinyint] 当前生效模板的标记
   */
  public isActive!: number
  /**
   * @description [text] 模板内容
   */
  public content!: string
  /**
   * @description [mediumtext] 邮箱发送模板
   */
  public emailEntityStr!: string
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
    this.isActive = 0
    this.content = ''
    this.emailEntityStr = ''
  }

  public fc_propertyMapper() {
    return {
      templateId: 'template_id',
      modelKey: 'model_key',
      isActive: 'is_active',
      content: 'content',
      emailEntityStr: 'email_entity_str',
      createTime: 'create_time',
      updateTime: 'update_time',
    }
  }
}

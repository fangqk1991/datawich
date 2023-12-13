import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'panel_id',
  'model_key',
  'author',
  'name',
  'config_data_str',
  'create_time',
  'update_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'panel_id',
  'model_key',
  'author',
  'name',
  'config_data_str',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'model_key',
  'author',
  'name',
  'config_data_str',
  'create_time',
]

const dbOptions = {
  table: 'model_panel',
  primaryKey: 'panel_id',
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __ModelPanel extends FeedBase {
  /**
   * @description [char(32)] Panel ID，具备唯一性
   */
  public panelId!: string
  /**
   * @description [varchar(63)] 模型键值，SQL 外键 -> data_model.model_key
   */
  public modelKey!: string
  /**
   * @description [varchar(255)] 创建者邮箱
   */
  public author!: string
  /**
   * @description [varchar(127)] 名称
   */
  public name!: string
  /**
   * @description [text] 描述信息，空 | JSON 字符串
   */
  public configDataStr!: string
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
    this.author = ''
    this.name = ''
    this.configDataStr = ''
  }

  public fc_propertyMapper() {
    return {
      panelId: 'panel_id',
      modelKey: 'model_key',
      author: 'author',
      name: 'name',
      configDataStr: 'config_data_str',
      createTime: 'create_time',
      updateTime: 'update_time',
    }
  }
}

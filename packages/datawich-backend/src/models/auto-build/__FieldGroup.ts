import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'model_key',
  'group_key',
  'name',
  'display_mode',
  'display_tmpl',
  'create_time',
  'update_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'model_key',
  'group_key',
  'name',
  'display_mode',
  'display_tmpl',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'name',
  'display_mode',
  'display_tmpl',
]

const dbOptions = {
  table: 'field_group',
  primaryKey: ['model_key', 'group_key'],
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __FieldGroup extends FeedBase {
  /**
   * @description [varchar(63)] 模型键值，SQL 外键 -> data_model.model_key
   */
  public modelKey!: string
  /**
   * @description [varchar(63)] 字段组键值
   */
  public groupKey!: string
  /**
   * @description [varchar(255)] 字段组名称
   */
  public name!: string
  /**
   * @description [varchar(63)] 展现形式，枚举值见 FieldDisplayMode 定义
   */
  public displayMode!: string
  /**
   * @description [text] 展示内容模板
   */
  public displayTmpl!: string
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
    this.displayMode = 'Collapse'
    this.displayTmpl = ''
  }

  public fc_propertyMapper() {
    return {
      modelKey: 'model_key',
      groupKey: 'group_key',
      name: 'name',
      displayMode: 'display_mode',
      displayTmpl: 'display_tmpl',
      createTime: 'create_time',
      updateTime: 'update_time',
    }
  }
}

import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'column_key',
  'model_key',
  'ref_model_key',
  'column_name',
  'content_tmpl',
  'weight',
  'is_template',
  'display_scope',
  'create_time',
  'update_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'column_key',
  'model_key',
  'ref_model_key',
  'column_name',
  'content_tmpl',
  'weight',
  'is_template',
  'display_scope',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'ref_model_key',
  'column_name',
  'content_tmpl',
  'weight',
  'is_template',
  'display_scope',
]

const dbOptions = {
  table: 'model_display_column',
  primaryKey: 'column_key',
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __ModelDisplayColumn extends FeedBase {
  /**
   * @description [varchar(63)] 列 ID，UUID
   */
  public columnKey!: string
  /**
   * @description [varchar(63)] 模型键值，SQL 外键 -> data_model.model_key
   */
  public modelKey!: string
  /**
   * @description [varchar(63)] 模型关联键值
   */
  public refModelKey!: string
  /**
   * @description [varchar(127)] 字段名称
   */
  public columnName!: string
  /**
   * @description [varchar(255)] 展示内容
   */
  public contentTmpl!: string
  /**
   * @description [int] 权重，用于排序
   */
  public weight!: number
  /**
   * @description [tinyint] 是否为模板类型
   */
  public isTemplate!: number
  /**
   * @description [varchar(63)] 自定义视图使用对象(列表或详情)
   */
  public displayScope!: string
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
    this.columnName = ''
    this.contentTmpl = ''
    this.weight = 0
    this.isTemplate = 0
  }

  public fc_propertyMapper() {
    return {
      columnKey: 'column_key',
      modelKey: 'model_key',
      refModelKey: 'ref_model_key',
      columnName: 'column_name',
      contentTmpl: 'content_tmpl',
      weight: 'weight',
      isTemplate: 'is_template',
      displayScope: 'display_scope',
      createTime: 'create_time',
      updateTime: 'update_time',
    }
  }
}

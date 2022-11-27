import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'link_id',
  'model_key',
  'field_key',
  'ref_model',
  'ref_field',
  'is_foreign_key',
  'is_inline',
  'fk_name',
  'on_update_action',
  'on_delete_action',
  'extras_info',
  'create_time',
  'update_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'link_id',
  'model_key',
  'field_key',
  'ref_model',
  'ref_field',
  'is_foreign_key',
  'is_inline',
  'fk_name',
  'on_update_action',
  'on_delete_action',
  'extras_info',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'is_foreign_key',
  'is_inline',
  'fk_name',
  'on_update_action',
  'on_delete_action',
  'extras_info',
  'create_time',
]

const dbOptions = {
  table: 'field_link',
  primaryKey: 'link_id',
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __FieldLink extends FeedBase {
  /**
   * @description [varchar(63)] 链接 UID
   */
  public linkId!: string
  /**
   * @description [varchar(63)] 模型键值，SQL 外键 -> model_field.model_key
   */
  public modelKey!: string
  /**
   * @description [varchar(63)] 字段键值，SQL 外键 -> model_field.field_key
   */
  public fieldKey!: string
  /**
   * @description [varchar(63)] 模型键值，SQL 外键 -> model_field.model_key
   */
  public refModel!: string
  /**
   * @description [varchar(63)] 字段键值，SQL 外键 -> model_field.field_key
   */
  public refField!: string
  /**
   * @description [tinyint] 是否具备外键约束
   */
  public isForeignKey!: number
  /**
   * @description [tinyint] 是否采用内联的方式
   */
  public isInline!: number
  /**
   * @description [varchar(127)] 外键名称
   */
  public fkName!: string
  /**
   * @description [varchar(127)] 字段类型: 枚举值见 TriggerAction 定义
   */
  public onUpdateAction!: string
  /**
   * @description [varchar(127)] 字段类型: 枚举值见 TriggerAction 定义
   */
  public onDeleteAction!: string
  /**
   * @description [mediumtext] 附加信息，空 | JSON 字符串
   */
  public extrasInfo!: string
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
    this.isForeignKey = 0
    this.isInline = 0
    this.fkName = ''
    this.onUpdateAction = ''
    this.onDeleteAction = ''
    this.extrasInfo = ''
  }

  public fc_propertyMapper() {
    return {
      linkId: 'link_id',
      modelKey: 'model_key',
      fieldKey: 'field_key',
      refModel: 'ref_model',
      refField: 'ref_field',
      isForeignKey: 'is_foreign_key',
      isInline: 'is_inline',
      fkName: 'fk_name',
      onUpdateAction: 'on_update_action',
      onDeleteAction: 'on_delete_action',
      extrasInfo: 'extras_info',
      createTime: 'create_time',
      updateTime: 'update_time',
    }
  }
}

import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'model_key',
  'field_key',
  'name',
  'required',
  'use_default',
  'default_value',
  'field_type',
  'extras_info',
  'remarks',
  'weight',
  'is_system',
  'is_hidden',
  'is_deleted',
  'create_time',
  'update_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'model_key',
  'field_key',
  'name',
  'required',
  'use_default',
  'default_value',
  'field_type',
  'extras_info',
  'remarks',
  'weight',
  'is_system',
  'is_hidden',
  'is_deleted',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'name',
  'required',
  'use_default',
  'default_value',
  'field_type',
  'extras_info',
  'remarks',
  'weight',
  'is_system',
  'is_hidden',
  'is_deleted',
]

const dbOptions = {
  table: 'model_field',
  primaryKey: ['model_key', 'field_key'],
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __ModelField extends FeedBase {
  /**
   * @description [varchar(63)] 模型键值，SQL 外键 -> data_model.model_key
   */
  public modelKey!: string
  /**
   * @description [varchar(63)] 字段键值，由用户自行指定；(model_key, field_key) 具备唯一性
   */
  public fieldKey!: string
  /**
   * @description [varchar(255)] 字段名称
   */
  public name!: string
  /**
   * @description [tinyint] 是否为必填项
   */
  public required!: number
  /**
   * @description [tinyint] 是否自动填充默认值
   */
  public useDefault!: number
  /**
   * @description [varchar(255)] 默认值
   */
  public defaultValue!: string
  /**
   * @description [varchar(255)] 字段类型: 枚举值见 FieldType 定义
   */
  public fieldType!: string
  /**
   * @description [mediumtext] 附加信息，空 | JSON 字符串
   */
  public extrasInfo!: string
  /**
   * @description [varchar(255)] 备注
   */
  public remarks!: string
  /**
   * @description [int] 权重，用于排序
   */
  public weight!: number
  /**
   * @description [tinyint] 是否为系统保留字段
   */
  public isSystem!: number
  /**
   * @description [tinyint] 是否隐藏
   */
  public isHidden!: number
  /**
   * @description [tinyint] 是否已被删除
   */
  public isDeleted!: number
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
    this.required = 0
    this.useDefault = 0
    this.defaultValue = ''
    this.fieldType = ''
    this.extrasInfo = ''
    this.remarks = ''
    this.weight = 0
    this.isSystem = 0
    this.isHidden = 0
    this.isDeleted = 0
  }

  public fc_propertyMapper() {
    return {
      modelKey: 'model_key',
      fieldKey: 'field_key',
      name: 'name',
      required: 'required',
      useDefault: 'use_default',
      defaultValue: 'default_value',
      fieldType: 'field_type',
      extrasInfo: 'extras_info',
      remarks: 'remarks',
      weight: 'weight',
      isSystem: 'is_system',
      isHidden: 'is_hidden',
      isDeleted: 'is_deleted',
      createTime: 'create_time',
      updateTime: 'update_time',
    }
  }
}

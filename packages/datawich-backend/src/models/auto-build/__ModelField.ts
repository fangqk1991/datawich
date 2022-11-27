import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'model_key',
  'field_key',
  'group_key',
  'name',
  'input_hint',
  'required',
  'use_default',
  'default_value',
  'field_type',
  'extras_info',
  'remarks',
  'special',
  'weight',
  'is_system',
  'is_hidden',
  'is_deleted',
  'for_broadcast',
  'star',
  'create_time',
  'update_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'model_key',
  'field_key',
  'group_key',
  'name',
  'input_hint',
  'required',
  'use_default',
  'default_value',
  'field_type',
  'extras_info',
  'remarks',
  'special',
  'weight',
  'is_system',
  'is_hidden',
  'is_deleted',
  'for_broadcast',
  'star',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'group_key',
  'name',
  'input_hint',
  'required',
  'use_default',
  'default_value',
  'field_type',
  'extras_info',
  'remarks',
  'special',
  'weight',
  'is_system',
  'is_hidden',
  'is_deleted',
  'for_broadcast',
  'star',
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
   * @description [varchar(63)] 字段组键值
   */
  public groupKey!: string
  /**
   * @description [varchar(255)] 字段名称
   */
  public name!: string
  /**
   * @description [text] 用户输入提示
   */
  public inputHint!: string
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
   * @description [tinyint] 是否为特殊字段
   */
  public special!: number
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
   * @description [tinyint] 字段数据变更时是否广播
   */
  public forBroadcast!: number
  /**
   * @description [tinyint] 是否被分析师关注
   */
  public star!: number
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
    this.groupKey = ''
    this.name = ''
    this.inputHint = ''
    this.required = 0
    this.useDefault = 0
    this.defaultValue = ''
    this.fieldType = ''
    this.extrasInfo = ''
    this.remarks = ''
    this.special = 0
    this.weight = 0
    this.isSystem = 0
    this.isHidden = 0
    this.isDeleted = 0
    this.forBroadcast = 0
    this.star = 0
  }

  public fc_propertyMapper() {
    return {
      modelKey: 'model_key',
      fieldKey: 'field_key',
      groupKey: 'group_key',
      name: 'name',
      inputHint: 'input_hint',
      required: 'required',
      useDefault: 'use_default',
      defaultValue: 'default_value',
      fieldType: 'field_type',
      extrasInfo: 'extras_info',
      remarks: 'remarks',
      special: 'special',
      weight: 'weight',
      isSystem: 'is_system',
      isHidden: 'is_hidden',
      isDeleted: 'is_deleted',
      forBroadcast: 'for_broadcast',
      star: 'star',
      createTime: 'create_time',
      updateTime: 'update_time',
    }
  }
}

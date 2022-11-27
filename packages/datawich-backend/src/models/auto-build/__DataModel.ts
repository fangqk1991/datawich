import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'model_key',
  'model_type',
  'short_key',
  'name',
  'description',
  'remarks',
  'version',
  'access_level',
  'is_retained',
  'is_data_insertable',
  'is_data_modifiable',
  'is_data_deletable',
  'is_data_exportable',
  'is_online',
  'is_custom',
  'is_library',
  'is_locked',
  'use_email',
  'is_broadcast',
  'is_deleted',
  'star',
  'wechatbot_key',
  'author',
  'default_member_level',
  'sample_date',
  'tags',
  'extras_info',
  'create_time',
  'update_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'model_key',
  'model_type',
  'short_key',
  'name',
  'description',
  'remarks',
  'version',
  'access_level',
  'is_retained',
  'is_data_insertable',
  'is_data_modifiable',
  'is_data_deletable',
  'is_data_exportable',
  'is_online',
  'is_custom',
  'is_library',
  'is_locked',
  'use_email',
  'is_broadcast',
  'is_deleted',
  'star',
  'wechatbot_key',
  'author',
  'default_member_level',
  'sample_date',
  'tags',
  'extras_info',
]
const _modifiableCols: string[] = [
  // prettier-ignore
  'model_type',
  'name',
  'description',
  'remarks',
  'version',
  'access_level',
  'is_retained',
  'is_data_insertable',
  'is_data_modifiable',
  'is_data_deletable',
  'is_data_exportable',
  'is_online',
  'is_custom',
  'is_library',
  'is_locked',
  'use_email',
  'is_broadcast',
  'is_deleted',
  'star',
  'wechatbot_key',
  'default_member_level',
  'sample_date',
  'tags',
  'extras_info',
]

const dbOptions = {
  table: 'data_model',
  primaryKey: 'model_key',
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __DataModel extends FeedBase {
  /**
   * @description [varchar(63)] 模型键值，由用户自行指定，具备唯一性
   */
  public modelKey!: string
  /**
   * @description [varchar(127)] 模型类型: 枚举值见 ModelType 定义
   */
  public modelType!: string
  /**
   * @description [varchar(4)] 模型 short_key 值，由用户自行指定，具备唯一性
   */
  public shortKey!: string | null
  /**
   * @description [varchar(127)] 模型名称
   */
  public name!: string
  /**
   * @description [text] 模型描述
   */
  public description!: string
  /**
   * @description [varchar(255)] 备注
   */
  public remarks!: string
  /**
   * @description [int] 版本号
   */
  public version!: number
  /**
   * @description [varchar(32)] 可访问的级别: 枚举值见 AccessLevel 定义
   */
  public accessLevel!: string
  /**
   * @description [tinyint] 是否为系统预留模型（不可删除）
   */
  public isRetained!: number
  /**
   * @description [tinyint] 数据是否可插入
   */
  public isDataInsertable!: number
  /**
   * @description [tinyint] 数据是否可修改
   */
  public isDataModifiable!: number
  /**
   * @description [tinyint] 数据是否可删除
   */
  public isDataDeletable!: number
  /**
   * @description [tinyint] 数据是否可导出
   */
  public isDataExportable!: number
  /**
   * @description [tinyint] 是否已上线
   */
  public isOnline!: number
  /**
   * @description [tinyint] 是否自定义
   */
  public isCustom!: number
  /**
   * @description [tinyint] 是否可以作为子模型被其他模型引用
   */
  public isLibrary!: number
  /**
   * @description [tinyint] 是否锁定，被锁定的模型不可修改
   */
  public isLocked!: number
  /**
   * @description [tinyint] 是否发送邮件通知
   */
  public useEmail!: number
  /**
   * @description [tinyint] 数据变更时是否广播
   */
  public isBroadcast!: number
  /**
   * @description [tinyint] 是否已被删除
   */
  public isDeleted!: number
  /**
   * @description [tinyint] 是否被分析师关注
   */
  public star!: number
  /**
   * @description [varchar(255)] 微信机器人接口地址
   */
  public wechatbotKey!: string
  /**
   * @description [varchar(255)] 创建者邮箱
   */
  public author!: string
  /**
   * @description [int] 默认成员级别: 新建成员时会将此值赋值给 model_member.member_level
   */
  public defaultMemberLevel!: number
  /**
   * @description [date] 采样日期，目前主要用于数据源模型
   */
  public sampleDate!: string
  /**
   * @description [text] 模型标签，如 GoodsBilling, GoodsPower
   */
  public tags!: string
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
    this.modelType = 'NormalModel'
    this.shortKey = null
    this.name = ''
    this.description = ''
    this.remarks = ''
    this.version = 0
    this.accessLevel = 'Protected'
    this.isRetained = 0
    this.isDataInsertable = 1
    this.isDataModifiable = 1
    this.isDataDeletable = 1
    this.isDataExportable = 0
    this.isOnline = 0
    this.isCustom = 0
    this.isLibrary = 0
    this.isLocked = 0
    this.useEmail = 0
    this.isBroadcast = 0
    this.isDeleted = 0
    this.star = 0
    this.wechatbotKey = ''
    this.author = ''
    this.defaultMemberLevel = 1
    this.sampleDate = '1970-01-01'
    this.tags = ''
    this.extrasInfo = ''
  }

  public fc_propertyMapper() {
    return {
      modelKey: 'model_key',
      modelType: 'model_type',
      shortKey: 'short_key',
      name: 'name',
      description: 'description',
      remarks: 'remarks',
      version: 'version',
      accessLevel: 'access_level',
      isRetained: 'is_retained',
      isDataInsertable: 'is_data_insertable',
      isDataModifiable: 'is_data_modifiable',
      isDataDeletable: 'is_data_deletable',
      isDataExportable: 'is_data_exportable',
      isOnline: 'is_online',
      isCustom: 'is_custom',
      isLibrary: 'is_library',
      isLocked: 'is_locked',
      useEmail: 'use_email',
      isBroadcast: 'is_broadcast',
      isDeleted: 'is_deleted',
      star: 'star',
      wechatbotKey: 'wechatbot_key',
      author: 'author',
      defaultMemberLevel: 'default_member_level',
      sampleDate: 'sample_date',
      tags: 'tags',
      extrasInfo: 'extras_info',
      createTime: 'create_time',
      updateTime: 'update_time',
    }
  }
}

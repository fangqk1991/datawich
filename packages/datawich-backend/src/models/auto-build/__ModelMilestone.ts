import { DBObserver, FeedBase } from 'fc-feed'
import { DBProtocolV2, FCDatabase } from 'fc-sql'

const _cols: string[] = [
  // prettier-ignore
  'uid',
  'model_key',
  'tag_name',
  'description',
  'metadata_str',
  'create_time',
]
const _insertableCols: string[] = [
  // prettier-ignore
  'uid',
  'model_key',
  'tag_name',
  'description',
  'metadata_str',
]
const _modifiableCols: string[] = [
  // prettier-ignore
]

const dbOptions = {
  table: 'model_milestone',
  primaryKey: ['model_key', 'tag_name'],
  cols: _cols,
  insertableCols: _insertableCols,
  modifiableCols: _modifiableCols,
}

export default class __ModelMilestone extends FeedBase {
  /**
   * @description [char(32)] UID，具备唯一性
   */
  public uid!: string
  /**
   * @description [varchar(63)] 模型键值，SQL 外键 -> data_model.model_key
   */
  public modelKey!: string
  /**
   * @description [varchar(63)] 自定义标签
   */
  public tagName!: string
  /**
   * @description [text] 里程碑描述
   */
  public description!: string
  /**
   * @description [mediumtext] 模型 Metadata 信息，JSON 字符串
   */
  public metadataStr!: string
  /**
   * @description [timestamp] 创建时间
   */
  public createTime!: string

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
    if (this.constructor['_staticDBObserver']) {
      this.dbObserver = this.constructor['_staticDBObserver']
    }
  }

  public fc_defaultInit() {
    // This function is invoked by constructor of FCModel
    this.description = ''
    this.metadataStr = ''
  }

  public fc_propertyMapper() {
    return {
      uid: 'uid',
      modelKey: 'model_key',
      tagName: 'tag_name',
      description: 'description',
      metadataStr: 'metadata_str',
      createTime: 'create_time',
    }
  }
}

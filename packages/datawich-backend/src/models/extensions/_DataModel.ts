import __DataModel from '../auto-build/__DataModel'
import assert from '@fangcha/assert'
import { _ModelField } from './_ModelField'
import { _FieldIndex } from './_FieldIndex'
import { _FieldLink } from './_FieldLink'
import { Transaction } from 'fc-sql'
import { logger } from '@fangcha/logger'
import { _ModelGroup } from '../permission/_ModelGroup'
import { CommonGroup } from '../permission/CommonGroup'
import { SelectOption } from '@fangcha/tools'
import { GeneralModelSpaces, GroupSpace } from '@fangcha/general-group'
import { _ModelMilestone } from './_ModelMilestone'
import {
  DataModelExtrasData,
  DataModelModel,
  FieldLinkModel,
  FieldType,
  ForAnalysisParams,
  ModelFieldModel,
  ModelFullMetadata,
} from '@fangcha/datawich-service/lib/common/models'
import { _FieldGroup } from './_FieldGroup'
import { _ModelDisplayColumn } from './_ModelDisplayColumn'
import {
  AccessLevel,
  DataRecordEvent,
  DisplayScope,
  FieldDisplayMode,
  FieldHelper,
  GeneralPermissionDescriptor,
  ModelDisplayColumnModel,
  ModelType,
  ModelTypeDescriptor,
  RetainFieldSource,
  TransferSelectOption,
} from '@web/datawich-common/models'
import { GeneralDataHelper } from '@fangcha/datawich-service/lib/common/tools'

export class _DataModel extends __DataModel {
  protected _fields?: _ModelField[] = undefined
  protected _fieldLinks?: _FieldLink[] = undefined

  public constructor() {
    super()
  }

  public static async findModel<T extends _DataModel>(
    this: { new (): T },
    modelKey: string,
    transaction?: Transaction
  ) {
    return (await (this as any).findWithUid(modelKey, transaction)) as T
  }

  public clearFieldsCache() {
    this._fields = undefined
  }

  public async removeAllCustomFields() {
    const feeds = await this.getFields()
    for (const modelField of feeds) {
      if (!modelField.isSystem) {
        await this.deleteField(modelField)
      }
    }
  }

  public async getFields() {
    if (!this._fields) {
      const searcher = new _ModelField().fc_searcher()
      searcher.processor().addConditionKV('model_key', this.modelKey)
      searcher.processor().addOrderRule('weight', 'DESC')
      searcher.processor().addOrderRule('_rid', 'ASC')
      this._fields = (await searcher.queryAllFeeds()) as _ModelField[]
    }
    return this._fields
  }

  public async getVisibleFields() {
    const fields = await this.getFields()
    return fields.filter((field) => !field.isHidden)
  }

  public async getNormalFields() {
    const fields = await this.getFields()
    return fields.filter((field) => !field.isSystem)
  }

  public async getNormalTimestampFields() {
    const fields = await this.getFields()
    return fields.filter((field) => !field.isSystem && field.fieldType === FieldType.Datetime)
  }

  public async getSystemFields() {
    const fields = await this.getFields()
    return fields.filter((field) => field.isSystem)
  }

  public async getBroadcastFields() {
    const fields = await this.getFields()
    return fields.filter((field) => field.forBroadcast)
  }

  public async getFieldLinks() {
    if (!this._fieldLinks) {
      const searcher = new _FieldLink().fc_searcher()
      searcher.processor().addConditionKV('model_key', this.modelKey)
      this._fieldLinks = (await searcher.queryAllFeeds()) as _FieldLink[]
    }
    return this._fieldLinks
  }

  public async getUniqueIndexes() {
    const searcher = new _FieldIndex().fc_searcher()
    searcher.processor().addConditionKV('model_key', this.modelKey)
    searcher.processor().addSpecialCondition('is_unique != ?', 0)
    return (await searcher.queryAllFeeds()) as _FieldIndex[]
  }

  public static checkValidParams(params: DataModelModel, onlyCheckDefinedKeys = false) {
    if (!onlyCheckDefinedKeys) {
      assert.ok(!!params.modelKey, '模型 Key 不能为空')
      assert.ok(/^[a-z][a-z0-9_]{1,62}$/.test(params.modelKey), '模型 Key 需满足规则 /^[a-z][a-z0-9_]{1,62}$/')
    }
    if (!onlyCheckDefinedKeys || params.name !== undefined) {
      assert.ok(!!params.name, '业务名称不能为空')
    }
    if (!onlyCheckDefinedKeys || params.isOnline !== undefined) {
      assert.ok([0, 1].includes(params.isOnline), '是否发布 参数有误')
    }
    if (params.shortKey) {
      assert.ok(/^[A-Z]{2,4}$/.test(params.shortKey), '模型 short_key 需满足规则 /^[A-Z]{2,4}$/')
    }
    if (params.modelType) {
      assert.ok(ModelTypeDescriptor.checkValueValid(params.modelType), '模型类型 参数有误')
    }
  }

  public async checkFieldKeyUnique(fieldKey: string) {
    const searcher = new _FieldIndex().fc_searcher()
    searcher.processor().addConditionKV('model_key', this.modelKey)
    searcher.processor().addConditionKV('field_key', fieldKey)
    searcher.processor().addSpecialCondition('is_unique != 0')
    return (await searcher.queryCount()) > 0
  }

  public sqlTableName() {
    return `_${this.modelKey}`
  }

  public async getForeignLinks() {
    const fieldLinks = await this.getFieldLinks()
    return fieldLinks.filter((link) => link.isForeignKey)
  }

  public async getForeignLinkMap() {
    const links = await this.getForeignLinks()
    return links.reduce((result, cur) => {
      result[cur.fieldKey] = cur
      return result
    }, {}) as { [p: string]: _FieldLink }
  }

  public async getClearData(options: any) {
    const fields = await this.getFields()
    options = FieldHelper.cleanDataByModelFields(options, fields as any)
    return options
  }

  public async getColumnIndexes() {
    const searcher = new _FieldIndex().fc_searcher()
    searcher.processor().addConditionKV('model_key', this.modelKey)
    return searcher.queryAllFeeds()
  }

  public getMilestoneSearcher() {
    const searcher = new _ModelMilestone().fc_searcher()
    searcher.processor().setColumns(['uid', 'model_key', 'tag_name', 'description', 'create_time'])
    searcher.processor().addConditionKV('model_key', this.modelKey)
    searcher.processor().addOrderRule('_rid', 'DESC')
    return searcher
  }

  public async getUniqueColumnMap() {
    const uniqueIndexes = await this.getUniqueIndexes()
    return uniqueIndexes.reduce((result, cur) => {
      result[cur.fieldKey] = true
      return result
    }, {})
  }

  public async createField(params: ModelFieldModel) {
    assert.ok(/^[a-z_][a-z0-9_]{1,62}$/.test(params.fieldKey), '字段 Key 需满足规则 /^[a-z_][a-z0-9_]{1,62}$/')
    _ModelField.checkValidParams(params)
    const retainKeys = [
      'rid',
      'data_id',
      'model_key',
      'ignore',
      'author',
      'update_author',
      'create_time',
      'update_time',
    ]
    assert.ok(!retainKeys.includes(params.fieldKey), `${params.fieldKey} 为系统保留键名，请使用其他键名`)
    const field = new _ModelField()
    field.modelKey = this.modelKey
    field.fieldKey = params.fieldKey
    field.name = params.name
    field.required = params.required || 0
    field.useDefault = params.useDefault || 0
    field.defaultValue = params.defaultValue || ''
    field.star = 0
    field.fieldType = params.fieldType
    field.isSystem = 0
    field.remarks = params.remarks || ''
    field.inputHint = params.inputHint || ''

    const extras: any = {}
    if (params.extrasData && typeof params.extrasData === 'object') {
      Object.assign(extras, params.extrasData)
    }
    if ([FieldType.Tags, FieldType.MultiEnum].includes(field.fieldType as any)) {
      extras.options = params.options
    } else if ([FieldType.Enum, FieldType.TextEnum].includes(field.fieldType as any)) {
      if (params.constraintKey) {
        const constraintField = await _ModelField.findModelField(this.modelKey, params.constraintKey)
        assert.ok(!!constraintField, '约束字段不存在')
        assert.ok(
          [FieldType.Enum, FieldType.TextEnum].includes(constraintField.fieldType as any),
          '约束字段应为枚举类型'
        )
        params.options.forEach((option) => {
          assert.ok(!!option['restraintValueMap'], 'option.restraintValueMap 有误')
        })
        extras.constraintKey = params.constraintKey
      }
      if (extras.useEnumSelector !== undefined) {
        extras.useEnumSelector = params.useEnumSelector
      }
      extras.options = params.options
    } else if (field.fieldType === FieldType.Date || field.fieldType === FieldType.Datetime) {
      extras.dateRange = params.dateRange
    } else if (field.fieldType === FieldType.SingleLineText) {
      extras.searchable = params.searchable || 0
    }
    field.extrasInfo = JSON.stringify(extras)
    assert.ok(!(await field.checkExistsInDB()), '模型中已存在该字段，不可重复创建')

    await this.insertFieldToDB(field)
    if (params.isUnique) {
      await _FieldIndex.createIndex(field, 1)
    }
    return field
  }

  public async insertFieldToDB(field: _ModelField) {
    const database = this.dbSpec().database
    try {
      const runner = database.createTransactionRunner()
      await runner.commit(async (transaction) => {
        await field.addToDB(transaction)
        await field.rebuildEnumOptions(transaction)
        await this.increaseVersion(transaction)

        await field.addColumnToDB()
      })
    } catch (e) {
      logger.error(e)
      // SQL 表结构表更不会随事务回滚，因此需要在外键添加失败时，将已添加的表字段删除
      if ((e as any).original?.errno === 1452) {
        const tableHandler = database.tableHandler(this.sqlTableName())
        await tableHandler.dropColumn(field.fieldKey)
        assert.ok(false, '外键添加失败，因为本键默认值在关联模型中找不到对应的条目')
      }
      throw e
    }
  }

  public async increaseVersion(transaction: Transaction) {
    this.fc_edit()
    ++this.version
    await this.updateToDB(transaction)
  }

  /**
   * @description Dangerous!!!
   */
  public async deleteField(field: _ModelField) {
    const database = this.dbSpec().database
    try {
      const tableHandler = database.tableHandler(this.sqlTableName())
      await tableHandler.dropColumn(field.fieldKey)
    } catch (e) {
      logger.error(e)
      if ((e as any).original?.errno === 1091) {
        // Ignore
      } else {
        throw e
      }
    }
    const runner = database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      await field.deleteFromDB(transaction)
      await this.increaseVersion(transaction)
    })
  }

  public getExtrasData() {
    let data: Partial<DataModelExtrasData> = {}
    try {
      data = JSON.parse(this.extrasInfo) || {}
    } catch (e) {}
    return data
  }

  public dataTmplVariableList() {
    const { dataInfoTmpl = '' } = this.getExtrasData()
    const matches = dataInfoTmpl.match(/\{\{\.(.*?)\}\}/g)
    const items = matches ? [...matches] : []
    const keys = items.map((item) => item.match(/\{\{\.(.*?)\}\}/)![1])
    return [...new Set(keys)]
  }

  public renderData(data: { [p: string]: any }) {
    const { dataInfoTmpl = '' } = this.getExtrasData()
    return dataInfoTmpl.replace(/\{\{\.(.*?)\}\}/g, (_: any, dataKey: string) => {
      return data[dataKey]
    })
  }

  private _retainGroups?: CommonGroup[] = undefined
  public async getRetainGroups() {
    if (!this._retainGroups) {
      const searcher = CommonGroup.groupSearcher(GroupSpace.ModelRetainGroup)
      searcher
        .processor()
        .addSpecialCondition('group_id IN (SELECT group_id FROM model_group WHERE model_key = ?)', this.modelKey)
      this._retainGroups = (await searcher.queryAllFeeds()) as CommonGroup[]
    }
    return this._retainGroups
  }

  public static async generateModel<T extends _DataModel>(this: { new (): T }, params: DataModelModel | any) {
    const dataModel = new this()
    await dataModel.buildModel(params)
    return dataModel
  }

  public async buildModel(params: DataModelModel | any) {
    _DataModel.checkValidParams(params)
    this.modelKey = params.modelKey
    this.modelType = params.modelType || ModelType.NormalModel
    this.shortKey = params.shortKey || null
    this.name = params.name
    this.description = params.description || ''
    this.remarks = params.remarks || ''
    this.isOnline = params.isOnline
    this.accessLevel = params.accessLevel || AccessLevel.Protected
    this.isLibrary = params.isLibrary || 0
    this.isDataExportable = params.isDataExportable || 0
    this.star = params.star || 0
    this.author = params.author
    const extras: Partial<DataModelExtrasData> = {
      keyAlias: '',
      broadcastEventData: {
        [DataRecordEvent.Create]: true,
        [DataRecordEvent.Delete]: true,
        [DataRecordEvent.Update]: true,
      },
    }
    this.extrasInfo = JSON.stringify(extras)
    assert.ok(!(await this.checkExistsInDB()), '该模型(modelKey)已存在，不可重复创建')
    if (this.shortKey) {
      const searcher = _DataModel.dbSearcher()
      searcher.addConditionKV('short_key', this.shortKey)
      assert.ok(!(await searcher.querySingle()), `该模型标识符(${this.shortKey})已存在，不可重复创建`)
    }
    const database = this.dbSpec().database
    const tableName = this.sqlTableName()
    const runner = database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      const tableHandler = database.tableHandler(tableName)
      await tableHandler.createInDatabase()
      await tableHandler.addColumn('_data_id', 'CHAR(32) COLLATE ascii_bin NOT NULL UNIQUE')
      const fields: _ModelField[] = await this.makeSystemFields()
      await this.addToDB(transaction)
      for (const field of fields) {
        await field.addToDB(transaction)
      }
      {
        const fieldIndex = new _FieldIndex()
        fieldIndex.modelKey = this.modelKey
        fieldIndex.fieldKey = 'rid'
        fieldIndex.isUnique = 1
        await fieldIndex.strongAddToDB(transaction)
      }
      await this.makeRetainGroups(transaction)
      this._fields = undefined
    })
  }

  public dataConstraintName() {
    return `fk_${this.modelKey}_data_id`
  }

  public async makeSystemFields() {
    const systemFields = await this.getSystemFields()
    if (systemFields.length > 0) {
      return []
    }
    const tableName = this.sqlTableName()
    const database = this.dbSpec().database
    const tableHandler = database.tableHandler(tableName)

    const fields: _ModelField[] = []
    {
      const field = this.makeSystemField('rid', '序号', FieldType.Integer)
      fields.push(field)
    }
    {
      const field = this.makeSystemField('author', '创建者邮箱', FieldType.User)
      await tableHandler.addColumn(field.fieldKey, `VARCHAR(127) COLLATE ascii_bin NOT NULL DEFAULT ''`)
      await database.update(`ALTER TABLE ${tableName} ADD INDEX(\`${field.fieldKey}\`)`)
      fields.push(field)
    }
    {
      const field = this.makeSystemField('update_author', '更新者邮箱', FieldType.User)
      await tableHandler.addColumn(field.fieldKey, `VARCHAR(127) COLLATE ascii_bin NOT NULL DEFAULT ''`)
      await database.update(`ALTER TABLE ${tableName} ADD INDEX(\`${field.fieldKey}\`)`)
      fields.push(field)
    }
    {
      const field = this.makeSystemField('create_time', '创建时间', FieldType.Datetime)
      await tableHandler.addColumn(field.fieldKey, `TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`)
      fields.push(field)
    }
    {
      const field = this.makeSystemField('update_time', '更新时间', FieldType.Datetime)
      await tableHandler.addColumn(
        field.fieldKey,
        `TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
      )
      fields.push(field)
    }
    return fields
  }

  private makeSystemField(fieldKey: string, name: string, fieldType: FieldType) {
    const field = new _ModelField()
    field.modelKey = this.modelKey
    field.fieldKey = fieldKey
    field.name = name
    field.fieldType = fieldType
    field.required = 0
    field.isHidden = 0
    field.isSystem = 1
    return field
  }

  public async makeRetainGroups(transaction?: Transaction) {
    const handler = async (transaction: Transaction) => {
      const options = GeneralPermissionDescriptor.options()
      for (const option of options) {
        const builder = CommonGroup.groupBuilder(GroupSpace.ModelRetainGroup, this.author)
        builder.setObjKey(this.modelKey)
        builder.setName(`${this.modelKey} 保留组 [${option.label}]`)
        const group = await builder.build(transaction)
        const modelGroup = new _ModelGroup()
        modelGroup.modelKey = this.modelKey
        modelGroup.groupId = group.groupId
        await modelGroup.addToDB(transaction)

        const permission = new CommonGroup.CommonPermission()
        permission.groupId = group.groupId
        permission.scope = this.modelKey
        permission.permission = option.value as string
        await permission.addToDB(transaction)
      }
    }
    if (transaction) {
      await handler(transaction)
    } else {
      const runner = this.dbSpec().database.createTransactionRunner()
      await runner.commit(handler)
    }
  }

  public async getOuterModelsInUse() {
    const searcher = this.fc_searcher()
    searcher
      .processor()
      .addSpecialCondition(
        `EXISTS (SELECT ref_model FROM field_link WHERE ref_model = ? AND field_link.model_key = data_model.model_key)`,
        this.modelKey
      )
    return searcher.queryAllFeeds()
  }

  /**
   * @description Very Dangerous!!!
   */
  public async removeAllRecords(_operator: string) {
    const database = this.dbSpec().database
    const runner = database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      {
        const remover = database.remover()
        remover.transaction = transaction
        remover.setTable(this.sqlTableName())
        remover.addSpecialCondition('1')
        await remover.execute()
      }
    })
  }

  public async topField(fieldKey: string) {
    const field = await _ModelField.findModelField(this.modelKey, fieldKey)
    assert.ok(!!field, 'Field Not Found')

    const searcher = _ModelField.dbSearcher()
    searcher.setColumns(['MAX(weight) AS maxWeight'])
    searcher.addConditionKV('model_key', this.modelKey)
    const { maxWeight } = (await searcher.querySingle()) as any

    field.fc_edit()
    field.weight = maxWeight + 1
    await field.updateToDB()
  }

  public async assertReferenceKeyValid(referenceKey: string) {
    const [modelKey, fieldKey] = referenceKey.split('.')
    const referenceModel = await _DataModel.findModel(modelKey)
    assert.ok(!!referenceModel, '关联模型不存在')
    const referenceField = await _ModelField.findModelField(modelKey, fieldKey)
    assert.ok(!!referenceField, '关联字段不存在')
    const fieldIndex = await _FieldIndex.findIndex(modelKey, fieldKey)
    assert.ok(fieldIndex && !!fieldIndex.isUnique, '关联字段必须具备 Unique 属性')
  }

  public async assertFieldCanLinkReferenceKey(foreignField: _ModelField, referenceKey: string) {
    const [modelKey, fieldKey] = referenceKey.split('.')
    const referenceModel = await _DataModel.findModel(modelKey)
    assert.ok(!!referenceModel, '关联模型不存在')
    const referenceField = await _ModelField.findModelField(modelKey, fieldKey)
    assert.ok(!!referenceField, '关联字段不存在')
    const fieldIndex = await _FieldIndex.findIndex(modelKey, fieldKey)
    assert.ok(fieldIndex && !!fieldIndex.isUnique, '关联字段必须具备 Unique 属性')

    const curTable = this.sqlTableName()
    const refTable = referenceModel.sqlTableName()
    const searcher = this.dbSpec().database.searcher()
    searcher.setTable(curTable)
    searcher.markDistinct()
    searcher.setColumns([foreignField.fieldKey])
    searcher.addSpecialCondition(
      `NOT EXISTS (SELECT * FROM \`${refTable}\` WHERE \`${refTable}\`.\`${referenceField.fieldKey}\` = \`${curTable}\`.\`${foreignField.fieldKey}\`)`
    )
    const count = await searcher.queryCount()
    if (count > 0) {
      searcher.setPageInfo(0, 5)
      const items = await searcher.queryList()
      const invalidItemsStr = items.map((item) => item[foreignField.fieldKey]).join(', ')
      assert.ok(false, `当前存在不满足外键约束的数据 ${invalidItemsStr}，不可关联外键`)
    }
  }

  public async cloneFieldData(fromField: _ModelField, toField: _ModelField) {
    const database = this.dbSpec().database
    const sql = `UPDATE ${this.sqlTableName()} SET \`${toField.fieldKey}\` = \`${fromField.fieldKey}\``
    await database.update(sql, [])
  }

  public async transferIntEnumToTextEnum(field: _ModelField, options: TransferSelectOption[]) {
    assert.ok(field.fieldType === FieldType.Enum, '只能处理 Enum 类型的字段')
    options.forEach((option) => {
      assert.ok(!!option.value, '枚举值不能为空')
      assert.ok(!!option.label, '枚举名称不能为空')
      assert.ok(!!option.toValue, '目标值不能为空')
    })

    const toOptions = options.map((option) => {
      return {
        value: option.toValue,
        label: option.label,
      } as SelectOption
    })

    const database = this.dbSpec().database
    {
      field.fc_edit()
      field.fieldType = FieldType.TextEnum
      field.extrasInfo = JSON.stringify(Object.assign(field.extrasData(), { options: toOptions }))
      await field.updateToDB()
      await field.changeColumnToDB()
    }
    const runner = database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      await field.rebuildEnumOptions(transaction)
      for (const option of options) {
        const sql = `UPDATE ${field.sqlTableName()} SET \`${field.fieldKey}\` = ? WHERE \`${field.fieldKey}\` = ?`
        await database.update(sql, [option.toValue, `${option.value}`], transaction)
      }
      await this.increaseVersion(transaction)
    })
  }

  public async modifyField(field: _ModelField, params: ModelFieldModel) {
    _ModelField.checkValidParams(params, true)

    const extras: any = {}
    if (Object.prototype.toString.call(params.extrasData) === '[object Object]') {
      Object.assign(extras, params.extrasData)
    }
    if (params.options !== undefined) {
      const options = params.options.map((option) => {
        const data = {
          label: option.label,
          value: option.value,
        }
        if (option['restraintValueMap']) {
          data['restraintValueMap'] = option['restraintValueMap']
        }
        return data
      })
      if (field.fieldType === FieldType.Enum || field.fieldType === FieldType.TextEnum) {
        extras['constraintKey'] = params.constraintKey || ''
        // TODO: 暂时取消 options 的判断
        // const database = this.dbSpec().database
        // const model = new DataModel()
        // model.modelKey = field.modelKey
        // const tableName = model.sqlTableName()
        // const searcher = database.searcher()
        // searcher.setTable(tableName)
        // searcher.markDistinct()
        // searcher.setColumns([field.fieldKey])
        // // searcher.addSpecialCondition(`\`${field.fieldKey}\` > 0`)
        // const items = await searcher.queryList()
        // const usedValues = items.map((item) => item[field.fieldKey])
        // const inputValuesMap = options.reduce((result: any, cur: any) => {
        //   result[cur.value] = true
        //   return result
        // }, {})
        // usedValues.forEach((val) => {
        //   if (val) {
        //     assert.ok(val in inputValuesMap, `枚举值 ${val} 已被使用，不可删除`)
        //   }
        // })
      } else if (field.fieldType === FieldType.Tags) {
        // TODO: 暂时取消 options 的判断
        // const database = this.dbSpec().database
        // const model = new _DataModel()
        // model.modelKey = field.modelKey
        // const tableName = model.sqlTableName()
        // const searcher = database.searcher()
        // searcher.setTable(tableName)
        // searcher.markDistinct()
        // for (let i = 0; i < 32; ++i) {
        //   searcher.addColumn(`COUNT(IF((${field.fieldKey} & (1 << ${i})) > 0, 1, NULL)) AS count_${i}`)
        // }
        // const countMap = (await searcher.querySingle()) as { [p: string]: number }
        // const usedValues = Object.keys(countMap)
        //   .filter((key) => {
        //     return countMap[key] > 0
        //   })
        //   .map((key) => {
        //     return Number(key.replace('count_', ''))
        //   })
        // const inputValuesMap = options.reduce((result: any, cur: any) => {
        //   result[cur.value] = true
        //   return result
        // }, {})
        // usedValues.forEach((val) => {
        //   assert.ok(val in inputValuesMap, `标签值 ${val} 已被使用，不可删除或变更`)
        // })
      }
      extras.options = options
    }
    if (params.dateRange !== undefined) {
      extras.dateRange = params.dateRange
    }
    if (params.searchable !== undefined) {
      extras.searchable = params.searchable
    }
    if (params.referenceCheckedInfos !== undefined) {
      extras.referenceCheckedInfos = params.referenceCheckedInfos
    }
    if (params.referenceInline !== undefined) {
      extras.referenceInline = params.referenceInline
    }
    if (params.useEnumSelector !== undefined) {
      extras.useEnumSelector = params.useEnumSelector
    }
    if (params.keyAlias !== undefined) {
      extras.keyAlias = params.keyAlias
    }
    if (params.nameI18n !== undefined) {
      extras.nameI18n = params.nameI18n
    }

    const database = this.dbSpec().database
    const runner = database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      await field.updateFeed(params, extras, transaction)
      await field.rebuildEnumOptions(transaction)
      await this.increaseVersion(transaction)
    })
  }

  private _linkedGroups?: CommonGroup[] = undefined
  public async getLinkedGroups() {
    if (!this._linkedGroups) {
      const searcher = CommonGroup.groupSearcher(GeneralModelSpaces)
      searcher
        .processor()
        .addSpecialCondition(
          'EXISTS (SELECT permission.group_id FROM group_permission AS permission WHERE permission.scope IN (?, "*") AND permission.group_id = common_group.group_id) AND obj_key != ?',
          this.modelKey,
          this.modelKey
        )
      this._linkedGroups = (await searcher.queryAllFeeds()) as CommonGroup[]
    }
    return this._linkedGroups
  }

  // TODO: DataModelModel -> DataModelParams
  public async updateFeed(options: Partial<DataModelModel>) {
    delete options.star
    delete options.extrasInfo
    // TODO: 暂不支持对 shortKey 的修改
    delete options.shortKey

    _DataModel.checkValidParams(options as DataModelModel, true)
    if (options.shortKey && options.shortKey !== this.shortKey) {
      const searcher = _DataModel.dbSearcher()
      searcher.addConditionKV('short_key', options.shortKey)
      assert.ok(!(await searcher.querySingle()), `该模型标识符(${options.shortKey})已存在，不可重复创建`)
    }

    const extrasData = this.getExtrasData()
    if (options.keyAlias !== undefined) {
      extrasData.keyAlias = options.keyAlias
    }
    if (options.extrasData && options.extrasData.broadcastEventData) {
      extrasData.broadcastEventData = options.extrasData.broadcastEventData
    }
    if (options['dataInfoTmpl'] !== undefined) {
      extrasData.dataInfoTmpl = options['dataInfoTmpl']
    }

    this.fc_edit()
    this.fc_generateWithModel(options)
    this.extrasInfo = JSON.stringify(extrasData)
    await this.updateToDB()
  }

  public static async generateFullModel<T extends _DataModel>(
    this: { new (): T },
    params: ModelFullMetadata,
    operator: string
  ) {
    params.dataModel.modelKey = params.modelKey
    params.dataModel.author = operator
    params.modelFields.forEach((item) => {
      item.modelKey = params.modelKey
    })
    params.fieldLinks.forEach((item) => {
      item.modelKey = params.modelKey
    })
    params.fieldIndexes.forEach((item) => {
      item.modelKey = params.modelKey
    })
    params.fieldGroups.forEach((item) => {
      item.modelKey = params.modelKey
    })
    const dataModel = new this()
    await dataModel.buildModel(params.dataModel)
    for (const fieldParams of params.modelFields) {
      if (fieldParams.isSystem) {
        continue
      }
      const newField = new _ModelField()
      newField.fc_generateWithModel(fieldParams)
      await dataModel.insertFieldToDB(newField)
    }
    for (const linkParams of params.fieldLinks) {
      const newLink = new _FieldLink()
      newLink.fc_generateWithModel(linkParams)
      await _FieldLink.createLink(newLink.modelForClient())
    }
    for (const groupParams of params.fieldGroups) {
      await _FieldGroup.createGroup(groupParams)
    }
    const newFields = await dataModel.getFields()
    for (const indexParams of params.fieldIndexes) {
      if (indexParams.fieldKey === 'rid') {
        continue
      }
      const field = newFields.find((item) => item.fieldKey === indexParams.fieldKey)
      if (field) {
        await _FieldIndex.createIndex(field, indexParams.isUnique)
      }
    }
    return dataModel
  }

  public async getHoldingLinks() {
    const searcher = new _FieldLink().fc_searcher()
    searcher.processor().addConditionKV('model_key', this.modelKey)
    return searcher.queryAllFeeds()
  }

  public async getFieldGroups() {
    const searcher = new _FieldGroup().fc_searcher()
    searcher.processor().addConditionKV('model_key', this.modelKey)
    return searcher.queryAllFeeds()
  }

  public async getFieldGroupMap(): Promise<{ [p: string]: _FieldGroup }> {
    const items = await this.getFieldGroups()
    return items.reduce((result, cur) => {
      result[cur.groupKey] = cur
      return result
    }, {})
  }

  public modelForClient() {
    const extrasData = this.getExtrasData() as DataModelExtrasData
    const data = this.fc_pureModel() as DataModelModel
    data.powerData = {}
    data.tagList = this.tagList()
    data.extrasData = extrasData
    data.keyAlias = extrasData.keyAlias
    return data
  }

  public tagList() {
    return (this.tags || '')
      .split(',')
      .map((item) => item.trim())
      .filter((item) => !!item)
  }

  public async generateNotifyTemplateContent() {
    const fields = await this.getBroadcastFields()
    let template = ''
    for (const mainField of fields) {
      const links = await mainField.getFieldLinks()
      const dataKey = GeneralDataHelper.calculateDataKey(mainField)
      template += `${mainField.name}: {${dataKey}}\n`
      for (const link of links) {
        const model = await link.modelWithRefFields()
        const refFields = model.referenceFields
        for (const refField of refFields) {
          const dataKey = GeneralDataHelper.calculateDataKey(refField, mainField)
          template += `${refField.name}: {${dataKey}}\n`
        }
      }
    }
    return template
  }

  public static async updateForAnalysis(changedList: ForAnalysisParams[]) {
    const changedModelMap = {}
    const modelKeyList: string[] = []
    changedList
      .filter((item) => typeof item.checked === 'boolean')
      .forEach((item) => {
        modelKeyList.push(item.modelKey)
        changedModelMap[item.modelKey] = item.checked
      })
    const models = await _DataModel.getModelsByModelKeyList(modelKeyList)
    const runner = new _DataModel().dbSpec().database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      for (const model of models) {
        model.fc_edit()
        model.star = changedModelMap[model.modelKey]
        await model.updateToDB(transaction)
      }
    })
  }

  private static async getModelsByModelKeyList(modelKeyList: string[]) {
    const searcher = new _DataModel().fc_searcher()
    searcher.processor().addConditionKeyInSet('model_key', ...modelKeyList)
    return await searcher.queryAllFeeds()
  }

  public async makeCustomFields(DisplayScope: DisplayScope) {
    const feeds = (await this.getModelDisplayColumnList(DisplayScope)) as _ModelDisplayColumn[]
    const columns = feeds.map((feed) => feed.fc_pureModel())
    const fieldGroupMap = await this.getFieldGroupMap()
    let fields = await this.getFields()
    const columnTemplates = columns.map((column) => column.contentTmpl)
    const allLinks = await this.getFieldLinks()
    fields = fields.filter((field) => columnTemplates.includes(field.fieldKey))
    const fkNameMap = new Map()
    columns.forEach((column) => fkNameMap.set(column.contentTmpl, column.columnName))
    const result: ModelFieldModel[] = []
    for (const field of fields) {
      const data = field.modelForClient()
      const links = allLinks.filter((link) => link.fieldKey === field.fieldKey)
      const linkModels: FieldLinkModel[] = []
      if (links.length > 0) {
        links.forEach((link) => {
          const refModel = link.refModel
          const extraData = link.extrasData()
          assert.ok(Array.isArray(extraData['referenceCheckedInfos']), '不是array')
          extraData['referenceCheckedInfos'].forEach(
            (item: { fieldKey: string; mappingName: string; checked: boolean }) => {
              const key = field.fieldKey + '.' + refModel + '.' + item.fieldKey
              if (columnTemplates.includes(key)) {
                item.checked = true
                item.mappingName = fkNameMap.get(key)
              } else {
                item.checked = false
              }
            }
          )
          link.extrasInfo = JSON.stringify({
            referenceCheckedInfos: extraData['referenceCheckedInfos'],
          })
        })
        for (const link of links) {
          linkModels.push(await link.modelWithRefFields())
        }
      }
      if (fieldGroupMap[field.groupKey]) {
        data.groupName = fieldGroupMap[field.groupKey].name
        data.fieldDisplayMode = fieldGroupMap[field.groupKey].displayMode as FieldDisplayMode
        data.fieldDisplayTmpl = fieldGroupMap[field.groupKey].displayTmpl
      }
      data.refFieldLinks = linkModels
      result.push(data)
    }
    columns.forEach((column: any) => {
      if (column.refModelKey === RetainFieldSource.template) {
        column.fieldType = FieldType.Template
        column.name = column.columnName
        column.fieldDisplayTmpl =
          column.refModelKey === RetainFieldSource.template ? column.contentTmpl : `{${column.contentTmpl}}`
        column.refFieldLinks = []
        result.push(column as ModelFieldModel)
      }
    })
    return result
  }

  public async updateCustomDisplayColumns(paramsList: ModelDisplayColumnModel[], displayScope: DisplayScope) {
    const searcher = new _ModelDisplayColumn().fc_searcher()
    searcher.processor().addConditionKV('model_key', this.modelKey)
    searcher.processor().addConditionKV('display_scope', displayScope)
    const columnsBefore = await searcher.queryAllFeeds()
    const runner = new _ModelDisplayColumn().dbSpec().database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      for (const column of columnsBefore) {
        await column.deleteFromDB(transaction)
      }
      for (const params of paramsList) {
        const option = _ModelDisplayColumn.makeValidParams(params)
        option.modelKey = this.modelKey
        option.displayScope = displayScope
        await _ModelDisplayColumn.generateModelDisplayColumn(option, transaction)
      }
    })
  }

  public async getModelDisplayColumnList(displayScope: DisplayScope) {
    const searcher = new _ModelDisplayColumn().fc_searcher()
    searcher.processor().addConditionKV('model_key', this.modelKey)
    searcher.processor().addConditionKV('display_scope', displayScope)
    return await searcher.queryAllFeeds()
  }
}

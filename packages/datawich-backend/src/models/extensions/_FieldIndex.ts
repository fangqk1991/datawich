import __FieldIndex from '../auto-build/__FieldIndex'
import { Transaction } from 'fc-sql'
import assert from '@fangcha/assert'
import { _ModelField } from './_ModelField'
import { _DataModel } from './_DataModel'
import { FieldIndexModel } from '@fangcha/datawich-service/lib/common/models'
import { FieldHelper } from '@web/datawich-common/models'

export class _FieldIndex extends __FieldIndex {
  public constructor() {
    super()
  }

  public static async findIndex<T extends _FieldIndex>(
    this: { new (): T },
    modelKey: string,
    fieldKey: string,
    transaction?: Transaction
  ) {
    return (await (this as any).findOne(
      {
        model_key: modelKey,
        field_key: fieldKey,
      },
      transaction
    )) as T
  }

  public static async indexesForModelKey<T extends _FieldIndex>(this: { new (): T }, modelKey: string) {
    const searcher = new this().fc_searcher()
    searcher.processor().addConditionKV('model_key', modelKey)
    return (await searcher.queryAllFeeds()) as T[]
  }

  public static async createIndex(field: _ModelField, isUnique: number) {
    if (!isUnique) {
      assert.ok(!(await field.checkHasReferences()), '该字段已被外键引用，不可取消 Unique 属性')
    }
    const database = new _FieldIndex().dbSpec().database
    const model = new _DataModel()
    model.modelKey = field.modelKey
    const tableName = model.sqlTableName()
    const searcher = database.searcher()
    searcher.setTable(tableName)
    searcher.setColumns([
      'COUNT(*) AS count',
      `COUNT(DISTINCT \`${field.fieldKey}\`) AS uniqueCount`,
      `MAX(LENGTH(\`${field.fieldKey}\`)) AS maxLength`,
    ])
    searcher.addSpecialCondition(`\`${field.fieldKey}\` IS NOT NULL`)
    const result = (await searcher.querySingle()) as any
    assert.ok(result.maxLength <= 127, `当前存在字节长度大于 127 的数据，不可设置为索引属性`)
    if (isUnique) {
      assert.ok(result.count === result.uniqueCount, '该字段已有重复数据存在，不能设置为 Unique 属性，请先调整数据')
    }

    const runner = database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      const fieldIndex = new _FieldIndex()
      fieldIndex.modelKey = field.modelKey
      fieldIndex.fieldKey = field.fieldKey
      fieldIndex.isUnique = isUnique
      await fieldIndex.strongAddToDB(transaction)

      const columnSpec = FieldHelper.getFieldTypeDatabaseSpec(field as any, true)
      const tableHandler = database.tableHandler(field.sqlTableName())
      await tableHandler.changeColumn(field.fieldKey, columnSpec)
      await fieldIndex._dropSQLIndex()
      await fieldIndex._createSQLIndex()
    })
  }

  private async getField(transaction?: Transaction) {
    return _ModelField.findModelField(this.modelKey, this.fieldKey, transaction)
  }

  public async dropIndex() {
    const field = await this.getField()
    if (this.isUnique === 1) {
      assert.ok(!(await field.checkHasReferences()), '该字段已被外键引用，不可取消 Unique 属性')
    }

    const runner = this.dbSpec().database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      await this.deleteFromDB(transaction)
      await this._dropSQLIndex()
      const database = field.dbSpec().database
      const columnSpec = FieldHelper.getFieldTypeDatabaseSpec(field as any, false)
      const tableHandler = database.tableHandler(field.sqlTableName())
      await tableHandler.changeColumn(field.fieldKey, columnSpec)
    })
  }

  private async _createSQLIndex() {
    try {
      const database = this.dbSpec().database
      const tableName = this.sqlTableName()
      const indexName = this.fieldKey
      const sql =
        this.isUnique === 1
          ? `ALTER TABLE ${tableName} ADD UNIQUE \`${indexName}\` (\`${this.fieldKey}\`)`
          : `ALTER TABLE ${tableName} ADD INDEX \`${indexName}\` (\`${this.fieldKey}\`)`
      await database.update(sql)
    } catch (e) {
      if ((e as any).original?.errno === 1061) {
        // 索引已存在
      } else {
        throw e
      }
    }
  }

  private async _dropSQLIndex() {
    try {
      const database = this.dbSpec().database
      const tableName = this.sqlTableName()
      const indexName = this.fieldKey
      const sql = `ALTER TABLE ${tableName} DROP INDEX \`${indexName}\``
      await database.update(sql)
    } catch (e) {}
  }

  public sqlTableName() {
    const model = new _DataModel()
    model.modelKey = this.modelKey
    return model.sqlTableName()
  }

  public modelForClient() {
    return this.fc_pureModel() as FieldIndexModel
  }
}

import { FilterOptions, SearcherTools } from 'fc-feed'
import { makeUUID, PageResult } from '@fangcha/tools'
import { FCDatabase, SQLAdder, SQLModifier, SQLRemover } from 'fc-sql'
import { DBTable, DBTableField, DBTypicalRecord, FieldType } from '@fangcha/datawich-service'
import assert from '@fangcha/assert'

export class TableDataHandler<T = DBTypicalRecord> {
  public readonly database: FCDatabase
  public readonly table: DBTable

  public constructor(database: FCDatabase, table: DBTable) {
    this.database = database
    this.table = table
  }

  public fieldMapper() {
    return this.table.fields.reduce((result, cur) => {
      result[cur.fieldKey] = cur
      return result
    }, {} as { [p: string]: DBTableField })
  }

  public getSearcher(options: FilterOptions = {}) {
    const fieldKeys = this.table.fields.map((field) => field.fieldKey)
    const fields = this.table.fields
    const searcher = this.database.searcher()
    searcher.setTable(this.table.tableId)
    searcher.setColumns(fieldKeys)
    SearcherTools.injectConditions(searcher, {
      colsMapper: fieldKeys,
      exactSearchCols: [],
      fuzzySearchCols: [],
      gbkCols: [],
      params: options,
      timestampTypeCols: fields.filter((item) => item.fieldType === FieldType.Datetime).map((item) => item.fieldKey),
    })
    return searcher
  }

  public async getPageResult(options: FilterOptions = {}, fieldKeyList?: string[]): Promise<PageResult<T>> {
    const searcher = this.getSearcher(options)
    if (fieldKeyList) {
      searcher.setColumns(fieldKeyList)
    }
    const items = (await searcher.queryList()) as T[]

    return {
      offset: searcher['_offset'],
      length: items.length,
      totalCount: await searcher.queryCount(),
      items: items,
    }
  }

  public async getAllDataItems(options: FilterOptions = {}) {
    const searcher = this.getSearcher(options)
    searcher.setLimitInfo(-1, -1)
    return (await searcher.queryList()) as T[]
  }

  public async getDataRecord(recordId: string) {
    assert.ok(!!this.table.primaryKey, 'PrimaryKey missing.')
    const searcher = this.getSearcher()
    searcher.addConditionKV(this.table.primaryKey, recordId)
    return (await searcher.querySingle()) as T
  }

  public async createRecord(options: Partial<DBTypicalRecord>, author: string) {
    const fieldMapper = this.fieldMapper()
    const adder = new SQLAdder(this.database)
    adder.setTable(this.table.tableId)
    for (const key of Object.keys(options).filter((key) => !!fieldMapper[key] && fieldMapper[key].insertable)) {
      adder.insertKV(key, options[key])
    }
    this.table.fields.forEach((field) => {
      if (field.isUUID) {
        adder.insertKV(field.fieldKey, makeUUID())
      }
      if (field.isAuthor) {
        adder.insertKV(field.fieldKey, author || '')
      }
    })
    await adder.execute()
  }

  public async updateDataRecord(record: DBTypicalRecord, newOptions: Partial<DBTypicalRecord>) {
    assert.ok(!!this.table.primaryKey, 'PrimaryKey missing.')
    const fieldMapper = this.fieldMapper()
    const modifier = new SQLModifier(this.database)
    modifier.setTable(this.table.tableId)
    modifier.addConditionKV(this.table.primaryKey, record[this.table.primaryKey])
    for (const key of Object.keys(newOptions).filter((key) => !!fieldMapper[key] && fieldMapper[key].modifiable)) {
      modifier.updateKV(key, newOptions[key])
    }
    await modifier.execute()
  }

  public async deleteDataRecord(record: DBTypicalRecord) {
    assert.ok(!!this.table.primaryKey, 'PrimaryKey missing.')
    const remover = new SQLRemover(this.database)
    remover.setTable(this.table.tableId)
    remover.addConditionKV(this.table.primaryKey, record[this.table.primaryKey])
    await remover.execute()
  }

  // private async _bulkUpsertRecords(records: SchemaDataInfo[], author: string, transaction?: Transaction) {
  //   const fieldItems = this.fieldItems
  //   const bulkAdder = new SQLBulkAdder(this.table.dbSpec().database)
  //   bulkAdder.setTable(this.table.sqlTableName())
  //   if (transaction) {
  //     bulkAdder.transaction = transaction
  //   }
  //   bulkAdder.useUpdateWhenDuplicate()
  //   bulkAdder.setInsertKeys([
  //     'data_id',
  //     ...fieldItems.map((item) => item.key),
  //     'data_status',
  //     'author',
  //     'update_author',
  //   ])
  //   bulkAdder.declareTimestampKey(
  //     ...fieldItems.filter((field) => field.fieldType === DataFieldType.Datetime).map((item) => item.key)
  //   )
  //   for (let i = 0; i < records.length; ++i) {
  //     const data_id = records[i].data_id
  //     const dataItem = DataFieldHelper.purifyData(fieldItems, records[i]) as SchemaDataInfo
  //     dataItem.data_id = data_id
  //     if (!dataItem.data_id) {
  //       dataItem.data_id = makeUUID()
  //     }
  //     dataItem.author = author
  //     dataItem.update_author = author
  //     dataItem.data_status = DataStatus.Normal
  //     bulkAdder.putObject(dataItem as any)
  //   }
  //   await bulkAdder.execute()
  // }
  //
  // public async bulkUpsertRecords(
  //   records: SchemaDataInfo[],
  //   flags: { author?: string; canInsert?: boolean; canUpdate?: boolean }
  // ) {
  //   const author = flags.author || ''
  //   const database = this.table.dbSpec().database
  //
  //   const searcher = this.getSearcher({
  //     'data_id.$in': records.map((item) => item.data_id).filter((dataId) => !!dataId),
  //     'data_status.$notIn': [DataStatus.Deleting],
  //   })
  //   searcher.setLimitInfo(-1, -1)
  //   const existingItems = (await searcher.queryList()) as SchemaDataInfo[]
  //   const curDataMapper: { [dataId: string]: SchemaDataInfo } = {}
  //   for (const item of existingItems) {
  //     if (item.data_status === DataStatus.Creating || item.data_status === DataStatus.Updating) {
  //       item.draftData = DataFieldHelper.parseDraftData(item.draft_data_str)
  //     }
  //     curDataMapper[item.data_id] = item
  //   }
  //   const toUpdateItems = records.filter((record) => curDataMapper[record.data_id])
  //   const toInsertItems = records.filter((record) => !record.data_id)
  //   const fieldItems = this.fieldItems
  //   const tableName = this.table.sqlTableName()
  //
  //   const runner = database.createTransactionRunner()
  //   await runner.commit(async (transaction) => {
  //     if (flags.canInsert) {
  //       await this._bulkUpsertRecords(toInsertItems, author, transaction)
  //     } else {
  //       const bulkAdder = new SQLBulkAdder(database)
  //       bulkAdder.transaction = transaction
  //       bulkAdder.setTable(tableName)
  //       bulkAdder.setInsertKeys(['data_id', 'data_status', 'author', 'update_author', 'draft_data_str'])
  //       bulkAdder.useUpdateWhenDuplicate()
  //       for (let i = 0; i < toInsertItems.length; ++i) {
  //         const item = toInsertItems[i]
  //         const options = DataFieldHelper.purifyData(fieldItems, item) as SchemaDataInfo
  //         bulkAdder.putObject({
  //           data_id: item.data_id || makeUUID(),
  //           data_status: DataStatus.Creating,
  //           author: author,
  //           update_author: author,
  //           draft_data_str: JSON.stringify(options),
  //         })
  //       }
  //       await bulkAdder.execute()
  //     }
  //     if (flags.canUpdate) {
  //       await this._bulkUpsertRecords(toUpdateItems, author, transaction)
  //     } else {
  //       const bulkAdder = new SQLBulkAdder(database)
  //       bulkAdder.transaction = transaction
  //       bulkAdder.setTable(tableName)
  //       bulkAdder.setInsertKeys(['data_id', 'data_status', 'update_author', 'draft_data_str'])
  //       bulkAdder.useUpdateWhenDuplicate()
  //       for (let i = 0; i < toUpdateItems.length; ++i) {
  //         const item = toUpdateItems[i]
  //         const options = DataFieldHelper.purifyData(fieldItems, item.draftData || item) as SchemaDataInfo
  //         bulkAdder.putObject({
  //           data_id: item.data_id,
  //           data_status: DataStatus.Updating,
  //           update_author: author,
  //           draft_data_str: JSON.stringify(options),
  //         })
  //       }
  //       await bulkAdder.execute()
  //     }
  //   })
  // }
}

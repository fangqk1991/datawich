import { FilterOptions, SearcherTools } from 'fc-feed'
import { makeUUID, PageResult } from '@fangcha/tools'
import { FCDatabase, SQLAdder } from 'fc-sql'
import { DBTable, DBTableField, DBTypicalRecord, FieldType } from '@fangcha/datawich-service'

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

  public async getDataRecord(dataId: string) {
    const searcher = this.getSearcher()
    searcher.addConditionKV('uid', dataId)
    return (await searcher.querySingle()) as T
  }

  public async createRecord(options: Partial<DBTypicalRecord>) {
    const author = options.author || ''
    author
    const fieldMapper = this.fieldMapper()
    // options = DataFieldHelper.purifyData(this.fieldItems, options)
    const adder = new SQLAdder(this.database)
    adder.setTable(this.table.tableId)
    // adder.insertKV('data_id', dataId)
    // adder.insertKV('author', author)
    // adder.insertKV('update_author', author)

    for (const key of Object.keys(options).filter((key) => !!fieldMapper[key])) {
      adder.insertKV(key, options[key])
    }

    this.table.fields.forEach((field) => {
      if (field.isUUID) {
        adder.insertKV(field.fieldKey, makeUUID())
      }
    })
    await adder.execute()
  }

  // public async updateDataRecord(dataInfo: SchemaDataInfo, options: {}, flags: M_OperatorParams) {
  //   assert.ok(dataInfo.data_status !== DataStatus.Deleting, `数据当前处于待删除状态，不可修改`)
  //   options = DataFieldHelper.purifyData(this.fieldItems, options)
  //   const keys = Object.keys(options)
  //   assert.ok(keys.length > 0, '数据无修改')
  //
  //   const modifier = new SQLModifier(this.table.dbSpec().database)
  //   modifier.setTable(this.table.sqlTableName())
  //   modifier.addConditionKV('data_id', dataInfo.data_id)
  //   modifier.updateKV('update_author', flags.author || '')
  //   if (flags.withoutAudit) {
  //     for (const key of keys) {
  //       modifier.updateKV(key, options[key])
  //     }
  //     modifier.updateKV('data_status', DataStatus.Normal)
  //     modifier.updateKV('draft_data_str', null)
  //   } else {
  //     modifier.updateKV('data_status', DataStatus.Updating)
  //     modifier.updateKV('draft_data_str', JSON.stringify(options))
  //   }
  //   await modifier.execute()
  //   return await this.getDataRecord(dataInfo.data_id)
  // }
  //
  // public async deleteDataRecord(dataInfo: SchemaDataInfo, flags: M_OperatorParams) {
  //   assert.ok(dataInfo.data_status !== DataStatus.Deleting, `数据当前处于待删除状态，不可修改`)
  //   const dataStatus = flags.withoutAudit ? DataStatus.Deleted : DataStatus.Deleting
  //   const modifier = new SQLModifier(this.table.dbSpec().database)
  //   modifier.setTable(this.table.sqlTableName())
  //   modifier.updateKV('data_status', dataStatus)
  //   modifier.updateKV('update_author', flags.author || '')
  //   modifier.addConditionKV('data_id', dataInfo.data_id)
  //   await modifier.execute()
  //   return dataStatus
  // }
  //
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

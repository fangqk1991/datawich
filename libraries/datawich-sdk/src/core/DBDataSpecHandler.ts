import assert from '@fangcha/assert'
import { Context } from 'koa'
import { DBConnection, DBTable, DBTypicalRecord } from '@fangcha/datawich-service'
import { DBHandleSDK } from './DBHandleSDK'
import { DatabaseHandler } from './DatabaseHandler'
import { TableDataHandler } from './TableDataHandler'

export class DBDataSpecHandler {
  public readonly ctx: Context

  constructor(ctx: Context) {
    this.ctx = ctx
  }

  protected _connection!: DBConnection
  protected async prepareConnection() {
    if (!this._connection) {
      this._connection = await DBHandleSDK.options.getConnection(this.ctx.params.connectionId)
    }
    return this._connection
  }

  protected _table!: DBTable
  protected async prepareTable() {
    if (!this._table) {
      const tableId = this.ctx.params.tableId
      const connection = await this.prepareConnection()
      this._table = await DBHandleSDK.options.getTable(connection, tableId)
    }
    return this._table
  }

  public async handle(handler: (connection: DBConnection) => Promise<void>) {
    const connection = await this.prepareConnection()
    await handler(connection)
  }

  public async handleTable(handler: (table: DBTable, connection: DBConnection) => Promise<void>) {
    const connection = await this.prepareConnection()
    const table = await this.prepareTable()
    await handler(table, connection)
  }

  public async handleRecord(
    handler: (record: DBTypicalRecord, table: DBTable, connection: DBConnection) => Promise<void>
  ) {
    const connection = await this.prepareConnection()
    const table = await this.prepareTable()
    const database = new DatabaseHandler(connection).database()
    const recordId = this.ctx.params.recordId
    const record = await new TableDataHandler(database, table).getDataRecord(recordId)
    assert.ok(!!record, `Record[${table.primaryKey} = ${recordId}] missing.`)
    await handler(record, table, connection)
  }
}

import { _DBConnection } from '../models/database/_DBConnection'
import assert from '@fangcha/assert'
import { Context } from 'koa'
import { DBTable, DBTypicalRecord } from '@fangcha/datawich-service'
import { DatabaseHandler } from './DatabaseHandler'
import { DBSchemaHelper, TableDataHandler } from '@fangcha/datawich-sdk'
import { _DBTableExtras } from '../models/database/_DBTableExtras'

export class DatabaseSpecHandler {
  public readonly ctx: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
  }

  protected _connection!: _DBConnection
  protected async prepareConnection() {
    if (!this._connection) {
      const connection = await _DBConnection.findWithUid(this.ctx.params.connectionId)
      assert.ok(!!connection, '_DBConnection Not Found')
      this._connection = connection!
    }
    return this._connection
  }

  protected _table!: DBTable
  protected async prepareTable() {
    if (!this._table) {
      const tableId = this.ctx.params.tableId
      const connection = await this.prepareConnection()
      const tableExtras = await _DBTableExtras.findOne({
        connection_id: connection.uid,
        table_id: tableId,
      })
      this._table = await DBSchemaHelper.getTableSchema(
        new DatabaseHandler(connection).database(),
        tableId,
        tableExtras ? tableExtras.modelForClient() : undefined
      )
    }
    return this._table
  }

  public async handle(handler: (connection: _DBConnection) => Promise<void>) {
    const connection = await this.prepareConnection()
    await handler(connection)
  }

  public async handleTable(handler: (table: DBTable, connection: _DBConnection) => Promise<void>) {
    const connection = await this.prepareConnection()
    const table = await this.prepareTable()
    await handler(table, connection)
  }

  public async handleRecord(
    handler: (record: DBTypicalRecord, table: DBTable, connection: _DBConnection) => Promise<void>
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

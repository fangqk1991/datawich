import { _DBConnection } from '../models/database/_DBConnection'
import assert from '@fangcha/assert'
import { Context } from 'koa'
import { DBTable } from '@fangcha/datawich-service'
import { DatabaseHandler } from './DatabaseHandler'
import { DBSchemaHelper } from '@fangcha/datawich-sdk'

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
      const connection = await this.prepareConnection()
      this._table = await DBSchemaHelper.getTableSchema(
        new DatabaseHandler(connection).database(),
        this.ctx.params.tableId
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
}

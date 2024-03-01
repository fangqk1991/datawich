import { _DBConnection } from '../models/database/_DBConnection'
import { DBConnection, DBTable } from '@fangcha/datawich-service'
import assert from '@fangcha/assert'
import { EncryptionBox, makeUUID } from '@fangcha/tools'
import { DBHandleSDK } from '@fangcha/datawich-sdk'
import { Context } from 'koa'

export class DBConnectionHandler {
  public readonly connection: _DBConnection

  public constructor(connection: _DBConnection) {
    this.connection = connection
  }

  public static async generateConnection(params: DBConnection) {
    assert.ok(!!params.dbName, 'dbName missing')
    assert.ok(!!params.username, 'username missing')
    const connection = new _DBConnection()
    connection.uid = makeUUID()
    connection.dbHost = params.dbHost || '127.0.0.1'
    connection.dbPort = params.dbPort || 3306
    connection.dbName = params.dbName
    connection.username = params.username
    connection.password = new EncryptionBox(DBHandleSDK.options.aesKey).encrypt(params.password || '')
    await connection.addToDB()
    return connection
  }

  public async updateInfos(options: DBConnection) {
    if (options.password !== undefined) {
      options.password = new EncryptionBox(DBHandleSDK.options.aesKey).encrypt(options.password)
    }
    this.connection.fc_edit()
    this.connection.fc_generateWithModel(options)
    await this.connection.updateToDB()
  }
}

export class DBConnectionSpecHandler {
  public readonly ctx: Context

  public constructor(ctx: Context) {
    this.ctx = ctx
  }

  protected _connection!: _DBConnection
  protected async prepareConnection() {
    if (!this._connection) {
      const connection = (await _DBConnection.findWithUid(this.ctx.params.connectionId))!
      assert.ok(!!connection, '_DBConnection Not Found')
      this._connection = connection
    }
    return this._connection
  }

  public async handle(handler: (connection: _DBConnection) => Promise<void>) {
    const connection = await this.prepareConnection()
    await handler(connection)
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

  public async handleTable(handler: (table: DBTable, connection: DBConnection) => Promise<void>) {
    const connection = await this.prepareConnection()
    const table = await this.prepareTable()
    await handler(table, connection)
  }
}

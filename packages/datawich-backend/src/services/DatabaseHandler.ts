import { _DBConnection } from '../models/database/_DBConnection'
import { DBConnection } from '@fangcha/datawich-service'
import assert from '@fangcha/assert'
import { EncryptionBox, makeUUID } from '@fangcha/tools'
import { DatawichConfig } from '../DatawichConfig'
import { FCDatabase } from 'fc-sql'
import { DBOptionsBuilder } from '@fangcha/tools/lib/database'

const encryptionBox = new EncryptionBox(DatawichConfig.adminJwtSecret)

export class DatabaseHandler {
  public readonly connection: _DBConnection

  public constructor(connection: _DBConnection) {
    this.connection = connection
  }

  public static async makeHandler(uid: string) {
    const connection = await _DBConnection.findWithUid(uid)
    assert.ok(!!connection, '_DBConnection Not Found')
    return new DatabaseHandler(connection!)
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
    connection.password = encryptionBox.encrypt(params.password || '')
    await connection.addToDB()
    return connection
  }

  public database() {
    // const database = FCDatabase.instanceWithName(this.connection.uid)
    const database = new FCDatabase()
    return database.init(
      new DBOptionsBuilder({
        host: this.connection.dbHost,
        port: this.connection.dbPort,
        database: this.connection.dbName,
        username: this.connection.username,
        password: encryptionBox.decrypt(this.connection.password),
        dialect: 'mysql',
      }).build()
    )
  }

  public async ping() {
    await this.database().ping()
  }

  public async updateInfos(options: DBConnection) {
    if (options.password !== undefined) {
      options.password = encryptionBox.encrypt(options.password)
    }
    this.connection.fc_edit()
    this.connection.fc_generateWithModel(options)
    await this.connection.updateToDB()
  }
}

import __DBConnection from '../auto-build/__DBConnection'
import { DBConnection } from '@fangcha/datawich-service'
import { makeUUID } from '@fangcha/tools'
import assert from '@fangcha/assert'

export class _DBConnection extends __DBConnection {
  public constructor() {
    super()
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
    connection.password = params.password || ''
    await connection.addToDB()
    return connection
  }

  public async updateInfos(options: DBConnection) {
    this.fc_edit()
    this.fc_generateWithModel(options)
    await this.updateToDB()
  }

  public toJSON() {
    return this.modelForClient()
  }

  public modelForClient(): DBConnection {
    return {
      uid: this.uid,
      dbHost: this.dbHost,
      dbPort: this.dbPort,
      dbName: this.dbName,
      username: this.username,
      password: '',
    }
  }
}

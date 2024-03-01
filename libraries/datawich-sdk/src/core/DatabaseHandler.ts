import { DBConnection, DBSchema } from '@fangcha/datawich-service'
import { EncryptionBox } from '@fangcha/tools'
import { FCDatabase } from 'fc-sql'
import { DBOptionsBuilder } from '@fangcha/tools/lib/database'
import { DBHandleSDK } from './DBHandleSDK'

export class DatabaseHandler {
  public readonly connection: DBConnection

  public constructor(connection: DBConnection) {
    this.connection = connection
  }

  public database() {
    return FCDatabase.instanceWithName(this.connection.uid).init(
      new DBOptionsBuilder({
        host: this.connection.dbHost,
        port: this.connection.dbPort,
        database: this.connection.dbName,
        username: this.connection.username,
        password: new EncryptionBox(DBHandleSDK.options.aesKey).decrypt(this.connection.password),
        dialect: 'mysql',
      }).build()
    )
  }

  public async ping() {
    delete this.database()['__curDatabase']().entity
    try {
      await this.database().ping()
    } catch (e) {
      throw e
    }
  }

  public async getSchemaInfo(): Promise<DBSchema> {
    const database = this.database()
    return {
      ...this.connection,
      password: '',
      tableIds: await database.getTables(),
    }
  }

  public async handle(handler: (database: FCDatabase) => Promise<void>) {
    await handler(this.database())
  }
}

import { DBConnection, DBTable } from '@fangcha/datawich-service'
import { FCDatabase } from 'fc-sql'
import { DatabaseHandler } from './DatabaseHandler'

export interface DBSdkOptions {
  aesKey: string
  getConnection: (connectionId: string) => Promise<DBConnection>
  getTable: (connection: DBConnection, tableId: string) => Promise<DBTable>

  getDatabase?: (connection: DBConnection) => FCDatabase
}

class _DBHandleSDK {
  public options!: DBSdkOptions

  public initOptions(options: DBSdkOptions) {
    this.options = options
    return this
  }

  public getDatabase(connection: DBConnection) {
    return this.options.getDatabase ? this.options.getDatabase(connection) : new DatabaseHandler(connection).database()
  }
}

export const DBHandleSDK = new _DBHandleSDK()

import { DBConnection, DBTable } from '@fangcha/datawich-service'

export interface DBSdkOptions {
  aesKey: string
  getConnection: (connectionId: string) => Promise<DBConnection>
  getTable: (connection: DBConnection, tableId: string) => Promise<DBTable>
}

class _DBHandleSDK {
  public options!: DBSdkOptions

  public initOptions(options: DBSdkOptions) {
    this.options = options
    return this
  }
}

export const DBHandleSDK = new _DBHandleSDK()

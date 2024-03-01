import __DBConnection from '../auto-build/__DBConnection'
import { DBConnection } from '@fangcha/datawich-service'

export class _DBConnection extends __DBConnection {
  public constructor() {
    super()
  }

  public toJSON() {
    return this.modelForClient()
  }

  public modelForClient(withPassword = false): DBConnection {
    return {
      uid: this.uid,
      dbHost: this.dbHost,
      dbPort: this.dbPort,
      dbName: this.dbName,
      username: this.username,
      password: withPassword ? this.password : '',
    }
  }
}

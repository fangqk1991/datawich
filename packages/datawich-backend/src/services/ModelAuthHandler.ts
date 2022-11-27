import { _DataModel } from '../models/extensions/_DataModel'
import { _ModelAuthorization } from '../models/extensions/_ModelAuthorization'
import { ClientAuthParams } from '@web/datawich-common/models'

export class ModelAuthHandler {
  private readonly _dataModel: _DataModel

  public constructor(dataModel: _DataModel) {
    this._dataModel = dataModel
  }

  public async getAuthModels() {
    const searcher = new _ModelAuthorization().fc_searcher()
    searcher.processor().addConditionKV('model_key', this._dataModel.modelKey)
    return (await searcher.queryAllFeeds()) as _ModelAuthorization[]
  }

  public async updateAuthModels(infos: ClientAuthParams[]) {
    const dataModel = this._dataModel
    const runner = dataModel.dbSpec().database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      for (const info of infos) {
        const auth = new _ModelAuthorization()
        auth.appid = info.appid
        auth.modelKey = dataModel.modelKey
        if (info.checked) {
          await auth.weakAddToDB(transaction)
        } else {
          await auth.deleteFromDB(transaction)
        }
      }
    })
  }
}

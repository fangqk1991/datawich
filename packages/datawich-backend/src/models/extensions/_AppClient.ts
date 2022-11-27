import __AppClient from '../auto-build/__AppClient'
import assert from '@fangcha/assert'
import { makeUUID, md5 } from '@fangcha/tools'
import { _ModelAuthorization } from './_ModelAuthorization'
import { FilterOptions } from 'fc-feed'
import { ClientAuthParams, ModelClientModel } from '@web/datawich-common/models'

export class _AppClient extends __AppClient {
  public constructor() {
    super()
  }

  public fc_searcher(params: FilterOptions = {}) {
    const keywords = (params.keywords || '').trim()
    const searcher = super.fc_searcher(params)
    if (keywords) {
      searcher.processor().addSpecialCondition('appid LIKE ?', `%${keywords}%`)
    }
    return searcher
  }

  public static checkValidParams(params: ModelClientModel) {
    assert.ok(!!params.appid, '应用 ID 不能为空')
    assert.ok(/^[a-z][a-z0-9_]{1,62}$/.test(params.appid), 'appid 需满足规则 /^[a-z][a-z0-9_]{1,62}$/')
    assert.ok(!!params.name, '应用不能为空')
  }

  public static async generateApp(params: ModelClientModel | any) {
    _AppClient.checkValidParams(params)
    const app = new _AppClient()
    app.appid = params.appid
    app.appSecret = md5(makeUUID())
    app.name = params.name
    assert.ok(!(await app.checkExistsInDB()), `该应用 ID [${app.appid}] 已被占用，请在更改后提交`)
    await app.addToDB()
    return app
  }

  public async updateApp(options: ModelClientModel) {
    this.fc_edit()
    if (options.name) {
      this.name = options.name
    }
    await this.updateToDB()
  }

  public modelForClient() {
    const data = this.fc_pureModel() as ModelClientModel
    // @ts-ignore
    delete data.appSecret
    return data
  }

  public async getAuthModels() {
    const searcher = new _ModelAuthorization().fc_searcher()
    searcher.processor().addConditionKV('appid', this.appid)
    return await searcher.queryAllFeeds()
  }

  public async authModel(modelKey: string) {
    const auth = new _ModelAuthorization()
    auth.appid = this.appid
    auth.modelKey = modelKey
    await auth.weakAddToDB()
  }

  public async updateAuthModels(infos: ClientAuthParams[]) {
    const runner = this.dbSpec().database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      for (const info of infos) {
        const auth = new _ModelAuthorization()
        auth.appid = this.appid
        auth.modelKey = info.modelKey
        if (info.checked) {
          await auth.weakAddToDB(transaction)
        } else {
          await auth.deleteFromDB(transaction)
        }
      }
    })
  }

  public makeToken() {
    return `${this.appid}:${this.appSecret}`
  }
}

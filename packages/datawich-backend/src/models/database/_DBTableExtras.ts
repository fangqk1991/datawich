import __DBTableExtras from '../auto-build/__DBTableExtras'
import { DBTableExtras, DBTableFieldsExtras } from '@fangcha/datawich-service'
import { md5 } from '@fangcha/tools'
import assert from '@fangcha/assert'

export class _DBTableExtras extends __DBTableExtras {
  public constructor() {
    super()
  }

  public static async prepareExtras(connectionId: string, tableId: string) {
    assert.ok(!!connectionId, 'connectionId missing.')
    assert.ok(!!tableId, 'tableId missing.')
    const uid = md5([connectionId, tableId].join(','))
    let feed = (await this.findWithUid(uid))!
    if (!feed) {
      feed = new this()
      feed.uid = uid
      feed.connectionId = connectionId
      feed.tableId = tableId
      feed.name = tableId
      feed.isPrivate = 0
      feed.fieldsExtrasStr = JSON.stringify({})
      await feed.addToDB()
    }
    return feed
  }

  public static async updateExtras(params: DBTableExtras) {
    assert.ok(!!params.connectionId, 'connectionId missing.')
    assert.ok(!!params.tableId, 'tableId missing.')
    const feed = await this.prepareExtras(params.connectionId, params.tableId)
    await feed.updateInfos(params)
    return feed
  }

  public async updateInfos(params: Partial<DBTableExtras>) {
    this.fc_edit()
    if (params.name !== undefined) {
      this.name = params.name
    }
    if (params.fieldsExtras !== undefined) {
      this.fieldsExtrasStr = JSON.stringify(params.fieldsExtras)
    }
    if (params.isPrivate !== undefined) {
      this.isPrivate = params.isPrivate ? 1 : 0
    }
    await this.updateToDB()
  }

  public fieldsExtras() {
    let data: DBTableFieldsExtras = {}
    try {
      data = JSON.parse(this.fieldsExtrasStr) || {}
    } catch (e) {}
    return data
  }

  public modelForClient(): DBTableExtras {
    return {
      uid: this.uid,
      connectionId: this.connectionId,
      tableId: this.tableId,
      name: this.name,
      isPrivate: !!this.isPrivate,
      fieldsExtras: this.fieldsExtras(),
    }
  }
}

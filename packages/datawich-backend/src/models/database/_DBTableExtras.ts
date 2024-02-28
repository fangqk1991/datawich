import __DBTableExtras from '../auto-build/__DBTableExtras'
import { DBTableExtras, DBTableFieldsExtras } from '@fangcha/datawich-service'
import { md5 } from '@fangcha/tools'
import assert from '@fangcha/assert'

export class _DBTableExtras extends __DBTableExtras {
  public constructor() {
    super()
  }

  public static async updateExtras(params: DBTableExtras) {
    assert.ok(!!params.connectionId, 'connectionId missing.')
    assert.ok(!!params.tableId, 'tableId missing.')
    const feed = new this()
    feed.uid = md5([params.connectionId, params.tableId].join(','))
    feed.connectionId = params.connectionId
    feed.tableId = params.tableId
    feed.name = params.name || params.tableId
    feed.fieldsExtrasStr = JSON.stringify(params.fieldsExtras || {})
    await feed.strongAddToDB()
    return feed
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
      fieldsExtras: this.fieldsExtras(),
    }
  }
}

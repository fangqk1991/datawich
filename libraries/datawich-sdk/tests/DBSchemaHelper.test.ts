import { DBSchemaHelper } from '../src'
import { DBTableHandler, FCDatabase } from 'fc-sql'
import { DBOptionsBuilder } from '@fangcha/tools/lib/database'
import { GlobalAppConfig } from 'fc-config'

describe('Test DBSchemaHelper.test.ts', () => {
  it(`getTableSchema`, async () => {
    const database = FCDatabase.instanceWithName('datawichDB').init(
      new DBOptionsBuilder(GlobalAppConfig.Datawich.mysql.datawichDB).build()
    )
    const schema = await DBSchemaHelper.getTableSchema(database, 'data_model')
    console.info(schema)
  })

  it(`getColumns`, async () => {
    const database = FCDatabase.instanceWithName('datawichDB').init(
      new DBOptionsBuilder(GlobalAppConfig.Datawich.mysql.datawichDB).build()
    )
    const handler = new DBTableHandler(database, 'data_model')
    console.info(await handler.getColumns())
  })

  it(`getIndexes`, async () => {
    const database = FCDatabase.instanceWithName('datawichDB').init(
      new DBOptionsBuilder(GlobalAppConfig.Datawich.mysql.datawichDB).build()
    )
    const handler = new DBTableHandler(database, 'data_model')
    console.info(await handler.getIndexes())
  })
})

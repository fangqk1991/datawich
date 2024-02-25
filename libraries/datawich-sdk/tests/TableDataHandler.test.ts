import { DBSchemaHelper, TableDataHandler } from '../src'
import { FCDatabase } from 'fc-sql'
import { DBOptionsBuilder } from '@fangcha/tools/lib/database'
import { GlobalAppConfig } from 'fc-config'

describe('Test TableDataHandler.test.ts', () => {
  it(`TableDataHandler`, async () => {
    const database = FCDatabase.instanceWithName('datawichDB').init(
      new DBOptionsBuilder(GlobalAppConfig.Datawich.mysql.datawichDB).build()
    )
    const schema = await DBSchemaHelper.getTableSchema(database, 'data_model')
    const handler = new TableDataHandler(database, schema)
    const pageResult = await handler.getPageResult()
    console.info(pageResult)
  })
})

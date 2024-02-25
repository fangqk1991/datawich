import { DBSchemaHelper } from '../src'
import { FCDatabase } from 'fc-sql'
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
})

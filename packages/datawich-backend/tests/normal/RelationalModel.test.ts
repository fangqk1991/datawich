import * as assert from 'assert'
import { generateModel } from '../ModelTestHelper'
import { _DataModel } from '../../src/models/extensions/_DataModel'
import { DataModelHandler } from '../../src/services/DataModelHandler'

describe('Test RelationalModel', () => {
  it(`Test make one`, async () => {
    const dataModel = await generateModel()
    assert.ok(!!(await _DataModel.findModel(dataModel.modelKey)))
    const tableHandler = dataModel.dbSpec().database.tableHandler(dataModel.sqlTableName())
    assert.ok(await tableHandler.checkTableExists())
    await new DataModelHandler(dataModel).destroyModel()
    assert.ok(!(await _DataModel.findModel(dataModel.modelKey)))
    assert.ok(!(await tableHandler.checkTableExists()))
  })
})

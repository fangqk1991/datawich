import * as assert from 'assert'
import { generateModel } from '../ModelTestHelper'
import { _DataModel, DataModelHandler } from '@fangcha/datawich-service'

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

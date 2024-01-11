import * as assert from 'assert'
import { logger } from '@fangcha/logger'
import { initGeneralDataSettingsTest } from '../GeneralDataServiceDev'
import { _DataModel } from '../../src/models/extensions/_DataModel'
import { ModelDataHandler } from '../../src/services/ModelDataHandler'

initGeneralDataSettingsTest()

describe('Test ModelDataHandler', () => {
  it(`Test makeDescriptionFields`, async () => {
    const dataModel = await _DataModel.prepareWithUid('demo')
    const dataHandler = new ModelDataHandler(dataModel)
    const descriptionFields = await dataHandler.makeDescriptionFields()
    logger.info(descriptionFields)
    assert.ok(Array.isArray(descriptionFields))
  })

  it(`Test transferItemsValueNaturalLanguage`, async () => {
    const dataModel = await _DataModel.prepareWithUid('demo')
    const dataHandler = new ModelDataHandler(dataModel)

    const searcher = await dataHandler.dataSearcher()
    searcher.setLimitInfo(0, 5)
    const items = (await searcher.queryList()) as any[]
    await dataHandler.transferItemsValueNaturalLanguage(items)
    logger.info(items)
    assert.ok(Array.isArray(items))
  })

  it(`Test describeDataItems`, async () => {
    const dataModel = await _DataModel.prepareWithUid('demo')
    const dataHandler = new ModelDataHandler(dataModel)
    const searcher = await dataHandler.dataSearcher()
    searcher.setLimitInfo(0, 5)
    const items = (await searcher.queryList()) as any[]
    const descriptionList = await dataHandler.describeDataItems(items)
    logger.info(descriptionList)
  })

  it(`Test upsertMultipleData`, async () => {
    const dataModel = await _DataModel.prepareWithUid('demo')
    const dataHandler = new ModelDataHandler(dataModel)
    await dataHandler.upsertMultipleData([])
  })
})

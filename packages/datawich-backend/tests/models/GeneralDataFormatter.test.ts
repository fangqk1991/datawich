import { logger } from '@fangcha/logger'
import { initGeneralDataSettingsTest } from '../GeneralDataServiceDev'
import { _DataModel } from '../../src/models/extensions/_DataModel'
import { DataModelHandler } from '../../src/services/DataModelHandler'
import { GeneralDataFormatter } from '@fangcha/datawich-service'

initGeneralDataSettingsTest()

describe('Test GeneralDataFormatter.test.ts', () => {
  it(`Test makeProfile / updateProfile`, async () => {
    const dataModel = await _DataModel.findModel('demo')
    const fullMetadata = await new DataModelHandler(dataModel).getFullMetadata()
    const fields = GeneralDataFormatter.makeDescribableFieldsFromMetadata(fullMetadata)
    logger.info(fields)
  })
})

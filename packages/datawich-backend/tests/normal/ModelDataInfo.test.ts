import { generateModel } from '../ModelTestHelper'
import { initGeneralDataSettingsTest } from '../GeneralDataServiceDev'
import { ModelDataInfo } from '../../src/services/ModelDataInfo'
import { DataModelHandler } from '../../src/services/DataModelHandler'
import { ModelDataHandler } from '../../src/services/ModelDataHandler'

initGeneralDataSettingsTest()

describe('Test DataBasicInfo', () => {
  it(`Test create / delete`, async () => {
    const dataModel = await generateModel()
    const dataHandler = new ModelDataHandler(dataModel)

    const customData = {}
    const newData = await dataHandler.createData(customData)
    const dataInfo = (await ModelDataInfo.findDataInfo(dataModel, newData.dataId))!
    await dataInfo.deleteFromDB()
    await new DataModelHandler(dataModel).destroyModel()
  })

  it(`Test removeAllRecords`, async () => {
    const dataModel = await generateModel()
    const dataHandler = new ModelDataHandler(dataModel)
    const customData = {}
    await dataHandler.createData(customData)
    await dataHandler.createData(customData)
    await dataHandler.createData(customData)
    await dataModel.removeAllRecords('fangquankun')
    await new DataModelHandler(dataModel).destroyModel()
  })
})

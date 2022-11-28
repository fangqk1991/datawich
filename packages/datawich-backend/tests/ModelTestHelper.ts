import { initGeneralDataSettingsTest } from './GeneralDataServiceDev'
import { DataModelModel } from '@web/datawich-common/models'
import { _DataModel } from '@fangcha/datawich-service'

initGeneralDataSettingsTest()

export const generateModel = async () => {
  const randomIndex = Math.floor(Math.random() * 100000)
  const modelData: Partial<DataModelModel> = {
    modelKey: `test_model_${randomIndex}`,
    name: `模型_${randomIndex}`,
    description: `模型_${randomIndex}`,
    isOnline: 1,
    author: 'some-author',
  }
  return _DataModel.generateModel(modelData)
}

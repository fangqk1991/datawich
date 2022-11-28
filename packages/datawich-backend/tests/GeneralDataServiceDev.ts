import { _DatawichService } from '@fangcha/datawich-service'
import { MyDatabase } from '../src/services/MyDatabase'

export const initGeneralDataSettingsTest = () => {
  _DatawichService.init({
    database: MyDatabase.datawichDB,
  })
}

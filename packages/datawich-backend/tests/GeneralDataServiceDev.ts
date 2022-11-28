import { MyDatabase } from '../src/services/MyDatabase'
import { _DatawichService } from '../src/services/_DatawichService'

export const initGeneralDataSettingsTest = () => {
  _DatawichService.init({
    database: MyDatabase.datawichDB,
  })
}

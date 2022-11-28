import { logger } from '@fangcha/logger'
import { initGeneralDataSettingsTest } from '../GeneralDataServiceDev'
import { MemberPower } from '@fangcha/datawich-service'

initGeneralDataSettingsTest()

describe('Test MemberPermission', () => {
  it(`Test permissionData`, async () => {
    const permissionData = await MemberPower.fetchPowerData({
      scope: 'demo',
      member: 'fangquankun',
    })
    logger.info(permissionData)
  })
})

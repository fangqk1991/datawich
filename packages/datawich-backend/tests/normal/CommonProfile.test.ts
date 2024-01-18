import * as assert from 'assert'
import { DiffMapper } from '@fangcha/tools'
import { initGeneralDataSettingsTest } from '../GeneralDataServiceDev'
import { _CommonProfile } from '../../src/models/extensions/_CommonProfile'
import { ProfileEvent } from '@fangcha/datawich-service'

initGeneralDataSettingsTest()

describe('Test CommonProfile', () => {
  it(`Test makeProfile / updateProfile`, async () => {
    const profile = await _CommonProfile.makeProfile('fangquankun', ProfileEvent.UserModelAppDisplay, 'demo')
    assert.ok(!!profile)
    assert.ok(typeof profile.profileData() === 'object')
    const profileAfter = {
      hiddenFieldsMap: {
        work_date: true,
        work_type: true,
      },
    }
    await profile.updateProfile(profileAfter)
    assert.ok(DiffMapper.checkEquals(profileAfter, profile.profileData()))
  })
})

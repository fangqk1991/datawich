import assert from '@fangcha/assert'
import { GeneralModelSpaces } from '@fangcha/general-group'
import { Context } from 'koa'
import { MemberPower } from '../models/permission/MemberPower'
import { AccessLevel, GeneralPermission } from '@web/datawich-common/models'
import { _DataModel } from '../models/extensions/_DataModel'

export class SessionChecker {
  email: string

  public constructor(ctx: Context) {
    const session = ctx.session as { curUserStr: () => string }
    this.email = session.curUserStr()
  }

  private _generalPowerData: {
    [p: string]: {
      [p: string]: boolean
    }
  } = {}
  public async getScopePowerData(scope: string) {
    if (!this._generalPowerData[scope]) {
      this._generalPowerData[scope] = await MemberPower.fetchPowerData({
        space: GeneralModelSpaces,
        scope: scope,
        member: this.email,
      })
    }
    return this._generalPowerData[scope]
  }

  public async checkModelPermission(dataModel: _DataModel, ...permissions: GeneralPermission[]) {
    const powerData = await this.getScopePowerData(dataModel.modelKey)
    if ('*' in powerData) {
      return true
    }
    for (const item of permissions) {
      if (!(item in powerData)) {
        return false
      }
    }
    return true
  }

  public async assertModelAccessible(dataModel: _DataModel, ...permissions: GeneralPermission[]) {
    const powerData = await this.getScopePowerData(dataModel.modelKey)
    if ('*' in powerData) {
      return
    }
    if (permissions.length === 0) {
      if (dataModel.accessLevel === AccessLevel.Protected) {
        assert.ok(
          Object.keys(powerData).length > 0,
          `本操作需要 scope = ${dataModel.modelKey} 的任一权限项；如有疑问，请联系 ${dataModel.author}`,
          403
        )
      }
    }
    for (const permission of permissions) {
      assert.ok(
        permission in powerData,
        `本操作需要 scope = ${dataModel.modelKey}, permission = ${permission} 的权限；如有疑问，请联系 ${dataModel.author}`,
        403
      )
    }
    return
  }
}

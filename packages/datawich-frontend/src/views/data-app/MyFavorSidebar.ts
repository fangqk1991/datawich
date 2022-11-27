import { CommonProfileApis, DataAppApis } from '@web/datawich-common/web-api'
import { DataModelModel, ProfileEvent } from '@web/datawich-common/models'
import { NotificationCenter } from 'notification-center-js'
import { CommonAPI } from '@fangcha/app-request'
import { MenuSubNode } from '@fangcha/vue'
import { MyAxios } from '@fangcha/vue/basic'
import { DatawichEventKeys } from '../../services/DatawichEventKeys'
import { getRouterToDataApp } from '../../services/ModelDataHelper'

class _MyFavorSidebar {
  private _favorApps?: DataModelModel[]
  private _favorMap: { [p: string]: DataModelModel } = {}

  public constructor() {}

  public async prepareFavorApps() {
    if (!this._favorApps) {
      const request = MyAxios(DataAppApis.FavorDataAppListGet)
      this._favorApps = (await request.quickSend()) as []
      const appMap = {}
      this._favorApps.forEach((app) => {
        appMap[app.modelKey] = app
      })
      this._favorMap = appMap
      NotificationCenter.defaultCenter().postNotification(DatawichEventKeys.kOnFavorDataAppsChanged, this._favorApps)
    }
    return this._favorApps!
  }

  public checkAppFavor(modelKey: string) {
    return !!this._favorMap[modelKey]
  }

  public async toggleAppFavor(modelKey: string) {
    let favorKeys: string[] = []
    const favorApps = this._favorApps || []
    if (this._favorMap[modelKey]) {
      favorKeys = favorApps.filter((app) => app.modelKey !== modelKey).map((app) => app.modelKey)
    } else {
      favorKeys = [...favorApps.map((app) => app.modelKey), modelKey]
    }

    const request = MyAxios(
      new CommonAPI(CommonProfileApis.ProfileUserInfoUpdate, ProfileEvent.UserModelSidebarApps, 'stuff')
    )
    request.setBodyData({
      favorModelKeys: favorKeys,
    })
    await request.execute()
    await this.reloadFavorApps()
  }

  public async reloadFavorApps() {
    const _datawichApp = window._datawichApp
    this._favorApps = undefined
    await this.prepareFavorApps()

    const favorApps = this.favorApps()
    const links: MenuSubNode[] = favorApps.map((app) => {
      const router = getRouterToDataApp(app)
      const path = _datawichApp.router.resolve(router).route.path
      return {
        titleEn: app.name,
        titleZh: app.name,
        path: `${path}?__refresh`,
      }
    })
    _datawichApp.updateMenuLinks('data-apps', [
      {
        titleEn: '所有应用',
        titleZh: '所有应用',
        path: '/v2/data-app',
      },
      ...links,
    ])
  }

  public favorApps() {
    return this._favorApps || []
  }
}

export const MyFavorSidebar = new _MyFavorSidebar()

import { SdkDatawichApis, SdkDatawichPages } from '@fangcha/datawich-service'

export const DatawichWebSDKConfig = {
  appPage: (modelKey: string) => SdkDatawichPages.buildRoute(SdkDatawichPages.WebAppDetailRoute, [modelKey]),
  apis: {
    AppListGet: SdkDatawichApis.ModelListGet,
    ProfileInfoUpdate: SdkDatawichApis.ProfileUserInfoUpdate,
  },
}

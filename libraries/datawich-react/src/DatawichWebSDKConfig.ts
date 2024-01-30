import { SdkDatawichApis, SdkDatawichPages } from '@fangcha/datawich-service'

export const DatawichWebSDKConfig = {
  appPage: (modelKey: string) => SdkDatawichPages.buildRoute(SdkDatawichPages.WebAppDetailRoute, [modelKey]),
  apis: {
    AppListGet: SdkDatawichApis.ModelListGet,

    ProfileInfoGet: SdkDatawichApis.ProfileInfoGet,
    ProfileInfoUpdate: SdkDatawichApis.ProfileUserInfoUpdate,

    ModelPanelListGet: SdkDatawichApis.ModelPanelListGet,
    ModelPanelInfoGet: SdkDatawichApis.ModelPanelGet,
    ModelPanelCreate: SdkDatawichApis.ModelPanelCreate,
    ModelPanelUpdate: SdkDatawichApis.ModelPanelUpdate,
    ModelPanelDelete: SdkDatawichApis.ModelPanelDelete,

    DataModelInfoGet: SdkDatawichApis.DataModelInfoGet,
    ModelVisibleFieldListGet: SdkDatawichApis.ModelVisibleFieldListGet,
  },
}

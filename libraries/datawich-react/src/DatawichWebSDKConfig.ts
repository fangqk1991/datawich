import { SdkDatawichApis, SdkDatawichPages } from '@fangcha/datawich-service'

export const DatawichWebSDKConfig = {
  appListPage: SdkDatawichPages.WebAppListRoute,
  appDetailPage: (modelKey: string) => SdkDatawichPages.buildRoute(SdkDatawichPages.WebAppDetailRoute, [modelKey]),
  apis: {
    AppListGet: SdkDatawichApis.ModelListGet,

    FavorAppListGet: SdkDatawichApis.FavorDataAppListGet,
    ProfileInfoGet: SdkDatawichApis.ProfileInfoGet,
    ProfileInfoUpdate: SdkDatawichApis.ProfileUserInfoUpdate,

    ModelPanelListGet: SdkDatawichApis.ModelPanelListGet,
    ModelPanelInfoGet: SdkDatawichApis.ModelPanelInfoGet,
    ModelPanelCreate: SdkDatawichApis.ModelPanelCreate,
    ModelPanelUpdate: SdkDatawichApis.ModelPanelUpdate,
    ModelPanelDelete: SdkDatawichApis.ModelPanelDelete,

    DataModelInfoGet: SdkDatawichApis.DataModelInfoGet,
    ModelVisibleFieldListGet: SdkDatawichApis.ModelVisibleFieldListGet,

    DataAppRecordCreate: SdkDatawichApis.DataAppRecordCreate,
    DataAppRecordGet: SdkDatawichApis.DataAppRecordGet,
    DataAppRecordUpdate: SdkDatawichApis.DataAppRecordUpdate,
    DataAppRecordDelete: SdkDatawichApis.DataAppRecordDelete,
  },
}

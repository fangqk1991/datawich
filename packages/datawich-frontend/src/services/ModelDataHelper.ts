import { DataModelModel } from '@fangcha/datawich-service/lib/common/models'

export const getRouterToDataApp = (dataModel: DataModelModel) => {
  return {
    name: 'DataDisplayView',
    params: {
      modelKey: dataModel.modelKey,
    },
  }
}

export const getRouterToModel = (modelKey: string) => {
  return {
    name: 'DataModelManageView',
    params: {
      modelKey: modelKey,
    },
  }
}

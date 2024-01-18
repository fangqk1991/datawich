import { Api } from '@fangcha/swagger'

export const OpenDataModelApis = {
  ModelListGet: {
    method: 'GET',
    route: '/api/general-data/v1/data-model',
    description: '获取模型信息列表',
  } as Api,
  ModelMasterMetadataGet: {
    method: 'GET',
    route: '/api/general-data/v1/data-model/:modelKey/metadata',
    description: '获取模型当前版本元信息',
  } as Api,
  ModelTagListGet: {
    method: 'GET',
    route: '/api/general-data/v1/data-model/:modelKey/tag',
    description: '获取模型版本列表',
  } as Api,
  ModelTagMetadataGet: {
    method: 'GET',
    route: '/api/general-data/v1/data-model/:modelKey/tag/:tagName/metadata',
    description: '获取模型指定版本元信息',
  } as Api,
}

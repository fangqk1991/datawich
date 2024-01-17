export const ModelClientApis = {
  ModelAuthClientListGet: {
    method: 'GET',
    route: '/api/v1/general-data/:modelKey/auth-client',
    description: '获取模型 API 访问者列表',
  },
  ModelAuthClientListUpdate: {
    method: 'PUT',
    route: '/api/v1/general-data/:modelKey/auth-client',
    description: '更新模型 API 访问者列表',
  },
}

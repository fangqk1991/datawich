export const ModelClientApis = {
  ModelAuthClientListGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/auth-client',
    description: '获取模型 API 访问者列表',
  },
  ModelAuthClientListUpdate: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/auth-client',
    description: '更新模型 API 访问者列表',
  },
  ModelAuthClientDelete: {
    method: 'DELETE',
    route: '/api/v2/general-data/:modelKey/auth-client/:appid',
    description: '移除模型 API 访问者',
  },
}

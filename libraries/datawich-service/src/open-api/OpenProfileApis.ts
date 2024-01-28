export const OpenProfileApis = {
  ProfileInfoGet: {
    method: 'GET',
    route: '/api/open/v1/event/:event/target/:target',
    description: '获取配置信息',
  },
  ProfileUserInfoUpdate: {
    method: 'PUT',
    route: '/api/open/v1/event/:event/target/:target',
    description: '修改配置信息',
  },
  FavorDataAppListGet: {
    method: 'GET',
    route: '/api/open/v1/favor-data-app',
    description: '获取收藏的应用',
  },
}

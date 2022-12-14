export const CommonProfileApis = {
  ProfileInfoGet: {
    method: 'GET',
    route: '/api/v1/common-profile/:event/target/:target',
    description: '获取配置信息',
  },
  ProfileUserInfoUpdate: {
    method: 'PUT',
    route: '/api/v1/common-profile/:event/target/:target',
    description: '修改配置信息',
  },
}

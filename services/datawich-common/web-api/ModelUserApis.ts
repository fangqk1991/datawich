export const ModelUserApis = {
  ModelUserGroupListGet: {
    method: 'GET',
    route: '/api/v2/model-user-group',
    description: '获取模型用户组列表',
  },
  ModelUserGroupCreate: {
    method: 'POST',
    route: '/api/v2/model-user-group',
    description: '创建模型用户组',
  },
  ModelUserGroupDelete: {
    method: 'DELETE',
    route: '/api/v2/model-user-group/:groupId',
    description: '删除模型用户组',
  },
  ModelUserGroupPermissionUpdate: {
    method: 'PUT',
    route: '/api/v2/model-user-group/:groupId/permission',
    description: '更新模型用户组权限',
  },
}

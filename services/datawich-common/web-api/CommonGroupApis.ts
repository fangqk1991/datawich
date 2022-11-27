export const CommonGroupApis = {
  GroupInfoUpdate: {
    method: 'PUT',
    route: '/api/v2/common-group/:groupId',
    description: '修改组信息',
  },
  GroupMemberListGet: {
    method: 'GET',
    route: '/api/v2/common-group/:groupId/member',
    description: '组成员列表获取',
  },
  GroupMemberAdd: {
    method: 'POST',
    route: '/api/v2/common-group/:groupId/member',
    description: '添加组成员',
  },
  GroupMemberUpdate: {
    method: 'PUT',
    route: '/api/v2/common-group/:groupId/member/:email',
    description: '修改组成员信息',
  },
  GroupMemberRemove: {
    method: 'DELETE',
    route: '/api/v2/common-group/:groupId/member/:email',
    description: '移除组成员',
  },
  GroupPermissionListGet: {
    method: 'GET',
    route: '/api/v2/common-group/:groupId/permission',
    description: '组权限列表获取',
  },
}

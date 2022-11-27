export const ModelMilestoneApis = {
  ModelMilestoneListGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/milestone',
    description: '获取模型元信息版本列表',
  },
  ModelMilestoneCreate: {
    method: 'POST',
    route: '/api/v2/general-data/:modelKey/milestone',
    description: '创建模型元信息版本',
  },
  ModelMilestoneImport: {
    method: 'POST',
    route: '/api/v2/general-data/:modelKey/milestone-import',
    description: '导入模型元信息版本',
  },
  ModelMilestoneDelete: {
    method: 'DELETE',
    route: '/api/v2/general-data/:modelKey/milestone/:tagName',
    description: '删除模型元信息版本',
  },
  ModelMasterMetadataGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/milestone/master/full-metadata',
    description: 'master 版本完整元信息获取',
  },
  ModelMilestoneMetadataGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/milestone/:tagName/full-metadata',
    description: '指定版本完整元信息获取',
  },
}

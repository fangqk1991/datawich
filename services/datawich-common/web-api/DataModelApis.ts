export const DataModelApis = {
  DataModelListGet: {
    method: 'GET',
    route: '/api/v2/general-data',
    description: '获取模型列表',
  },
  DataOpenModelListGet: {
    method: 'GET',
    route: '/api/v2/general-open-model',
    description: '获取可关联的模型列表',
  },
  DataContentModelListGet: {
    method: 'GET',
    route: '/api/v2/general-content-model',
    description: '获取内容管理模型列表',
  },
  DataModelCreate: {
    method: 'POST',
    route: '/api/v2/general-data',
    description: '创建模型',
  },
  DataModelImport: {
    method: 'POST',
    route: '/api/v2/general-data-import',
    description: '导入模型',
  },
  DataModelAccessibleCheck: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/check-accessible',
    description: '检查模型是否可访问',
  },
  DataModelClone: {
    method: 'POST',
    route: '/api/v2/general-data/:modelKey/clone',
    description: '模型克隆',
  },
  DataModelFullMetadataGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/full-metadata',
    description: '模型完整元信息获取',
  },
  DataModelInfoGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey',
    description: '获取模型信息',
  },
  DataModelOuterModelListGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/outer-model',
    description: '获取模型关联的外部模型列表',
  },
  DataModelUpdate: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey',
    description: '修改模型信息',
  },
  DataModelForAnalysisUpdate: {
    method: 'PUT',
    route: '/api/v2/general-data/data-model/for-analysis',
    description: '批量修改模型是否被数据分析信息',
  },
  DataModelDelete: {
    method: 'DELETE',
    route: '/api/v2/general-data/:modelKey',
    description: '删除模型',
  },
  DataModelRecordsEmpty: {
    method: 'DELETE',
    route: '/api/v2/general-data/:modelKey/empty-records',
    description: '清空模型所有数据',
  },
  DataModelSummaryInfoGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/summary-info',
    description: '获取模型概要信息',
  },
  ModelHoldingLinkListGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/holding-link',
    description: '获取模型持有的关联信息',
  },
  ModelHoldingLinkCreate: {
    method: 'POST',
    route: '/api/v2/general-data/:modelKey/holding-link',
    description: '创建模型关联信息',
  },
  ModelHoldingLinkUpdate: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/holding-link/:linkId',
    description: '更新模型关联信息',
  },
  ModelHoldingLinkDelete: {
    method: 'DELETE',
    route: '/api/v2/general-data/:modelKey/holding-link/:linkId',
    description: '删除模型关联信息',
  },
  ModelFieldGroupListGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/field-group',
    description: '获取模型字段组信息列表',
  },
  ModelFieldGroupCreate: {
    method: 'POST',
    route: '/api/v2/general-data/:modelKey/field-group',
    description: '创建模型字段组信息',
  },
  ModelFieldGroupUpdate: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/field-group/:groupKey',
    description: '更新模型字段组信息',
  },
  ModelFieldGroupDelete: {
    method: 'DELETE',
    route: '/api/v2/general-data/:modelKey/field-group/:groupKey',
    description: '删除模型字段组信息',
  },
  DataModelNotifyTemplateGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/notify-template',
    description: '获取模型通知模板信息',
  },
  DataModelNotifyTemplateUpdate: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/notify-template',
    description: '更新模型通知模板信息',
  },
}

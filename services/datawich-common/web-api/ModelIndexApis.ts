export const ModelIndexApis = {
  DataModelColumnIndexListGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/column-index',
    description: '获取模型列索引列表',
  },
  DataModelColumnIndexCreate: {
    method: 'POST',
    route: '/api/v2/general-data/:modelKey/column-index/:fieldKey',
    description: '创建模型索引',
  },
  DataModelColumnIndexDrop: {
    method: 'DELETE',
    route: '/api/v2/general-data/:modelKey/column-index/:fieldKey',
    description: '移除模型索引',
  },
}

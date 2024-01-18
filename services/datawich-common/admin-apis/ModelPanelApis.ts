export const ModelPanelApis = {
  ModelPanelListGet: {
    method: 'GET',
    route: '/api/v1/model/:modelKey/panel',
    description: '获取模型面板列表',
  },
  ModelPanelCreate: {
    method: 'POST',
    route: '/api/v1/model/:modelKey/panel',
    description: '创建模型面板',
  },
  ModelPanelGet: {
    method: 'GET',
    route: '/api/v1/model/:modelKey/panel/:panelId',
    description: '获取模型面板信息',
  },
  ModelPanelUpdate: {
    method: 'PUT',
    route: '/api/v1/model/:modelKey/panel/:panelId',
    description: '修改模型面板',
  },
  ModelPanelDelete: {
    method: 'DELETE',
    route: '/api/v1/model/:modelKey/panel/:panelId',
    description: '删除模型面板',
  },
}

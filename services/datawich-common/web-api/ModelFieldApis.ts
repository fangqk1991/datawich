import { Api } from '@fangcha/swagger'
export const ModelFieldApis = {
  DataModelFieldListGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/field',
    description: '模型完整字段列表获取',
  },
  DataModelAllFieldsDestroy: {
    method: 'DELETE',
    route: '/api/v2/general-data/:modelKey/destroy-all-fields',
    description: '移除所有字段',
  },
  DataModelFieldsRebuild: {
    method: 'POST',
    route: '/api/v2/general-data/:modelKey/rebuild-fields',
    description: '重建模型字段',
    parameters: [
      {
        name: 'bodyData',
        type: 'object',
        in: 'body',
        schema: {
          type: 'object',
          properties: {
            rawTableName: {
              type: 'string',
              example: 'xxxx',
            },
          },
        },
      },
    ],
  } as Api,
  DataModelVisibleFieldListGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/visible-field',
    description: '模型可见字段列表获取',
  },
  DataModelListCustomFieldsGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/custom-field/list',
    description: '模型使用模板字段列表获取',
  },
  DataModelDetailCustomFieldsGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/custom-field/detail',
    description: '模型使用模板字段列表获取',
  },
  DataModelFieldLinkListGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/field-link',
    description: '模型关联字段列表获取',
  },
  DataModelFieldCreate: {
    method: 'POST',
    route: '/api/v2/general-data/:modelKey/field',
    description: '创建模型字段',
  },
  DataModelFieldTop: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/field/:fieldKey/top-field',
    description: '置顶字段',
  },
  DataModelSystemFieldsShow: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/show-system-fields',
    description: '编辑需要展示的系统字段',
  },
  DataSystemModelFieldUpdate: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/system-field/:fieldKey',
    description: '修改系统字段信息',
  },
  DataModelFieldUpdate: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/field/:fieldKey',
    description: '修改字段信息',
  },
  DataModelEnumFieldTransfer: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/field/:fieldKey/transfer',
    description: '转换枚举字段定义信息',
  },
  DataModelFieldDelete: {
    method: 'DELETE',
    route: '/api/v2/general-data/:modelKey/field/:fieldKey',
    description: '删除字段',
  },
  DataModelFieldDataClone: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/field/:fieldKey/clone-data',
    description: '字段克隆',
  },
  DataModelFieldActionCreate: {
    method: 'POST',
    route: '/api/v2/general-data/:modelKey/field/:fieldKey/action',
    description: '添加字段动作',
  },
  DataModelFieldActionUpdate: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/field/:fieldKey/action/:actionId',
    description: '修改字段动作',
  },
  DataModelFieldActionDelete: {
    method: 'DELETE',
    route: '/api/v2/general-data/:modelKey/field/:fieldKey/action/:actionId',
    description: '修改字段动作',
  },
  DataModelBroadcastUpdate: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/update-broadcast-fields',
    description: '编辑需要展示的是否广播字段',
  },
  DataDisplayColumnUpdate: {
    method: 'PUT',
    route: '/api/v2/general-data/:modelKey/update-detail-display-fields',
    description: '编辑要展示在预览页中的字段',
  },
  DataModelDisplayColumnListGet: {
    method: 'GET',
    route: '/api/v2/general-data/:modelKey/data-display-column/:displayScope',
    description: '获取要展示在预览页中的字段列表',
  },
}

import { Api } from '@fangcha/swagger'
export const DataAppApis = {
  DataAppListGet: {
    method: 'GET',
    route: '/api/v1/data-app',
    description: '获取通用数据应用列表',
  },
  FavorDataAppListGet: {
    method: 'GET',
    route: '/api/v1/favor-data-app',
    description: '获取收藏的应用',
  },
  DataAppRecordListGet: {
    method: 'GET',
    route: '/api/v1/data-app/:modelKey/record',
    description: '获取应用数据列表',
  },
  /**
   * @deprecated
   */
  DataAppRecordListGetV2: {
    method: 'GET',
    route: '/api/v2/data-app/:modelKey/record',
    description: '获取应用数据列表',
  },
  DataAppExcelExport: {
    method: 'POST',
    route: '/api/v1/data-app/:modelKey/export-xls',
    description: '导出数据记录 Excel',
  },
  DataAppFieldInfosSearch: {
    method: 'GET',
    route: '/api/v1/data-app/:modelKey/field/:fieldKey/search',
    description: '搜索字段可填充联想项',
  },
  DataAppFieldLinkInfosSearch: {
    method: 'GET',
    route: '/api/v1/data-app/:modelKey/field-link/:linkId/ref-infos-search',
    description: '搜索字段可填充联想项',
  },
  DataAppRecordCreate: {
    method: 'POST',
    route: '/api/v1/data-app/:modelKey/record',
    description: '新建应用数据',
  } as Api,
  DataAppRecordPut: {
    method: 'PUT',
    route: '/api/v1/data-app/:modelKey/record',
    description: '新建应用数据(强制更新)',
  },
  // DataAppBatchRecordsPut: {
  //   method: 'PUT',
  //   route: '/api/v1/data-app/:modelKey/batch-records/import',
  //   description: '批量导入数据',
  // } as Api,
  DataAppRecordsImportedCallback: {
    method: 'POST',
    route: '/api/v1/data-app/:modelKey/records-imported-callback',
    description: '应用数据导入回调',
  },
  DataAppRecordGet: {
    method: 'GET',
    route: '/api/v1/data-app/:modelKey/record/:dataId',
    description: '获取数据记录',
  },
  DataAppRecordUpdate: {
    method: 'PUT',
    route: '/api/v1/data-app/:modelKey/record/:dataId',
    description: '更新数据记录',
  },
  DataAppRecordDelete: {
    method: 'DELETE',
    route: '/api/v1/data-app/:modelKey/record/:dataId',
    description: '删除数据记录',
  },
  DataAppRecordFavorAdd: {
    method: 'POST',
    route: '/api/v1/data-app/:modelKey/record/:dataId/favor',
    description: '数据记录 - 添加关注',
  },
  DataAppRecordFavorDelete: {
    method: 'DELETE',
    route: '/api/v1/data-app/:modelKey/record/:dataId/favor',
    description: '数据记录 - 移除关注',
  },
  DataAppRecordInfosGet: {
    method: 'GET',
    route: '/api/v1/data-app/:modelKey/record/:dataId/infos',
    description: '获取数据记录',
  },
  DataAppRecordEmailSend: {
    method: 'POST',
    route: '/api/v1/data-app/:modelKey/record/:dataId/email',
    description: '数据邮件发送',
  },
  DataAppRecordNotifyTemplateGet: {
    method: 'GET',
    route: '/api/v1/data-app/:modelKey/record/:dataId/template',
    description: '数据邮件模板获取',
  },
  DataAppExcelDemoDownload: {
    method: 'GET',
    route: '/api/v1/data-app/:modelKey/demo-excel',
    description: '下载用于导入的模板 Excel',
  },
  DataAppPendingListGet: {
    method: 'GET',
    route: '/api/v1/data-app/:modelKey/pending-resource/:resourceId',
    description: '获取待导入的应用数据',
  },

  ModelDataInfoGet: {
    method: 'GET',
    route: '/api/v1/data-app/:modelKey/data/:uniqueFieldKey/:fieldValue',
    description: '获取模型指定数据信息',
    detailInfo: 'uniqueFieldKey 必须具备唯一索引',
  },

  FullModelDataInfoGet: {
    method: 'GET',
    route: '/api/v1/data-app/:modelKey/record/:uniqueFieldKey/:fieldValue',
    description: '获取模型指定数据完整信息',
    detailInfo: 'uniqueFieldKey 必须具备唯一索引',
  },
}

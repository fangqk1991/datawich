export const DataAppApis = {
  DataAppListGet: {
    method: 'GET',
    route: '/api/v2/data-app',
    description: '获取通用数据应用列表',
  },
  FavorDataAppListGet: {
    method: 'GET',
    route: '/api/v2/favor-data-app',
    description: '获取收藏的应用',
  },
  DataAppRecordListGet: {
    method: 'GET',
    route: '/api/v2/data-app/:modelKey/record',
    description: '获取应用数据列表',
  },
  DataAppExcelExport: {
    method: 'POST',
    route: '/api/v2/data-app/:modelKey/export-xls',
    description: '导出数据记录 Excel',
  },
  DataAppFieldInfosSearch: {
    method: 'GET',
    route: '/api/v2/data-app/:modelKey/field/:fieldKey/search',
    description: '搜索字段可填充联想项',
  },
  DataAppFieldLinkInfosSearch: {
    method: 'GET',
    route: '/api/v2/data-app/:modelKey/field-link/:linkId/ref-infos-search',
    description: '搜索字段可填充联想项',
  },
  DataAppRecordCreate: {
    method: 'POST',
    route: '/api/v2/data-app/:modelKey/record',
    description: '新建应用数据',
  },
  DataAppRecordPut: {
    method: 'PUT',
    route: '/api/v2/data-app/:modelKey/record',
    description: '新建应用数据(强制更新)',
  },
  DataAppRecordsImportedCallback: {
    method: 'POST',
    route: '/api/v2/data-app/:modelKey/records-imported-callback',
    description: '应用数据导入回调',
  },
  DataAppRecordUpdate: {
    method: 'PUT',
    route: '/api/v2/data-app/:modelKey/record/:dataId',
    description: '更新数据记录',
  },
  DataAppRecordDelete: {
    method: 'DELETE',
    route: '/api/v2/data-app/:modelKey/record/:dataId',
    description: '删除数据记录',
  },
  DataAppRecordInfosGet: {
    method: 'GET',
    route: '/api/v2/data-app/:modelKey/record/:dataId/infos',
    description: '获取数据记录',
  },
  DataAppRecordActionPerformerGet: {
    method: 'GET',
    route: '/api/v2/data-app/:modelKey/record/:dataId/reference/:fieldKey/action/:actionId/performer',
    description: '获取记录动作执行信息',
  },
  DataAppRecordEmailSend: {
    method: 'POST',
    route: '/api/v2/data-app/:modelKey/record/:dataId/email',
    description: '数据邮件发送',
  },
  DataAppRecordNotifyTemplateGet: {
    method: 'GET',
    route: '/api/v2/data-app/:modelKey/record/:dataId/template',
    description: '数据邮件模板获取',
  },
  DataAppExcelDemoDownload: {
    method: 'GET',
    route: '/api/v2/data-app/:modelKey/demo-excel',
    description: '下载用于导入的模板 Excel',
  },
  DataAppPendingListGet: {
    method: 'GET',
    route: '/api/v2/data-app/:modelKey/pending-resource/:resourceId',
    description: '获取待导入的应用数据',
  },
}

import { Api } from '@fangcha/swagger'

export const SdkDBDataApis = {
  TableSchemaGet: {
    method: 'GET',
    route: '/api/datawich-sdk/db/v1/connection/:connectionId/table/:tableId/schema',
    description: '获取数据表 Schema',
  },
  RecordPageDataGet: {
    method: 'GET',
    route: '/api/datawich-sdk/db/v1/connection/:connectionId/table/:tableId/record',
    description: '获取分页数据（包含总数）',
  } as Api,
  RecordItemsGet: {
    method: 'GET',
    route: '/api/datawich-sdk/db/v1/connection/:connectionId/table/:tableId/all-records',
    description: '获取完整列表',
  } as Api,
  RecordCreate: {
    method: 'POST',
    route: '/api/datawich-sdk/db/v1/connection/:connectionId/table/:tableId/record',
    description: '创建数据记录',
  } as Api,
  RecordInfoGet: {
    method: 'GET',
    route: '/api/datawich-sdk/db/v1/connection/:connectionId/table/:tableId/record/:recordId',
    description: '获取数据记录',
  } as Api,
  RecordUpdate: {
    method: 'PUT',
    route: '/api/datawich-sdk/db/v1/connection/:connectionId/table/:tableId/record/:recordId',
    description: '更新数据记录',
  } as Api,
  RecordDelete: {
    method: 'DELETE',
    route: '/api/datawich-sdk/db/v1/connection/:connectionId/table/:tableId/record/:recordId',
    description: '删除数据记录',
  } as Api,
}

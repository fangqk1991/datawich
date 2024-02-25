import { Api } from '@fangcha/swagger'

export const DatabaseApis = {
  DBTableListGet: {
    method: 'GET',
    route: '/api/v1/db/datawich/table',
    description: '获取数据表 Schema',
  },
  TableSchemaGet: {
    method: 'GET',
    route: '/api/v1/db/datawich/table/:tableName/schema',
    description: '获取数据表 Schema',
  },
  RecordPageDataGet: {
    method: 'GET',
    route: '/api/v1/db/datawich/table/:tableName/record',
    description: '获取分页数据',
  } as Api,
  RecordCreate: {
    method: 'POST',
    route: '/api/v1/db/datawich/table/:tableName/record',
    description: '创建数据记录',
  } as Api,
  RecordInfoGet: {
    method: 'GET',
    route: '/api/v1/db/datawich/table/:tableName/record/:uid',
    description: '获取数据记录',
  } as Api,
  RecordUpdate: {
    method: 'PUT',
    route: '/api/v1/db/datawich/table/:tableName/record/:uid',
    description: '更新数据记录',
  } as Api,
  RecordDelete: {
    method: 'DELETE',
    route: '/api/v1/db/datawich/table/:tableName/record/:uid',
    description: '删除数据记录',
  } as Api,
}

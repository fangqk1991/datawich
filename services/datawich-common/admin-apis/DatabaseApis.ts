import { Api } from '@fangcha/swagger'

export const DatabaseApis = {
  ConnectionListGet: {
    method: 'GET',
    route: '/api/v1/db',
    description: '获取 DB 连接信息列表',
  },
  ConnectionCreate: {
    method: 'POST',
    route: '/api/v1/db',
    description: '创建 DB 连接信息',
  },
  ConnectionPing: {
    method: 'POST',
    route: '/api/v1/db/:connectionId/ping',
    description: 'Ping DB 连接信息',
  },
  ConnectionUpdate: {
    method: 'PUT',
    route: '/api/v1/db/:connectionId',
    description: '更新 DB 连接信息',
  },
  ConnectionDelete: {
    method: 'DELETE',
    route: '/api/v1/db/:connectionId',
    description: '删除 DB 连接信息',
  },
  ConnectionInfoGet: {
    method: 'GET',
    route: '/api/v1/db/:connectionId',
    description: '获取 DB 连接信息',
  },
  DatabaseSchemaGet: {
    method: 'GET',
    route: '/api/v1/db/:connectionId/schema',
    description: '获取 DB 描述信息',
  },
  TableSchemaGet: {
    method: 'GET',
    route: '/api/v1/db/:connectionId/table/:tableId/schema',
    description: '获取数据表 Schema',
  },
  TableSchemaUpdate: {
    method: 'PUT',
    route: '/api/v1/db/:connectionId/table/:tableId/extras',
    description: '更新数据表 Extras',
  },
  RecordPageDataGet: {
    method: 'GET',
    route: '/api/v1/db/:connectionId/table/:tableId/record',
    description: '获取分页数据',
  } as Api,
  RecordCreate: {
    method: 'POST',
    route: '/api/v1/db/:connectionId/table/:tableId/record',
    description: '创建数据记录',
  } as Api,
  RecordInfoGet: {
    method: 'GET',
    route: '/api/v1/db/:connectionId/table/:tableId/record/:recordId',
    description: '获取数据记录',
  } as Api,
  RecordUpdate: {
    method: 'PUT',
    route: '/api/v1/db/:connectionId/table/:tableId/record/:recordId',
    description: '更新数据记录',
  } as Api,
  RecordDelete: {
    method: 'DELETE',
    route: '/api/v1/db/:connectionId/table/:tableId/record/:recordId',
    description: '删除数据记录',
  } as Api,
}

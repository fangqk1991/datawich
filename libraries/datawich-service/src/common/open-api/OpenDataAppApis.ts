import { buildSwaggerSchema, makeSwaggerBodyDataParameters, SwaggerParameter } from '@fangcha/swagger'
import { DataAppSwaggerModelData } from '../models'

const dataPostInfoStr = [
  'Tips 1: 以本模型的各字段 Key 作为键值（注意不是字段 Name）',
  'Tips 2: 时间类型的数值请使用 ISO8601 格式(例: 2020-08-01T10:00:00+08:00) 或毫秒时间戳(例: 1596247200000)，以保证时区信息准确',
].join('\n')

export const OpenDataAppApis = {
  DataModelInfoGet: {
    method: 'GET',
    route: '/api/data-app/v1/data-model/:modelKey',
    description: '获取数据模型信息',
  },
  ModelFieldListGet: {
    method: 'GET',
    route: '/api/data-app/v1/data-model/:modelKey/field',
    description: '获取模型字段信息',
  },
  /**
   * @deprecated
   */
  DataAppRecordPageDataGet: {
    method: 'GET',
    route: '/api/data-app/v1/data-model/:modelKey/record',
    description: '获取应用分页数据',
    detailInfo: `Query Parameters 中可传递筛选参数，格式示例: {modelKey}.{fieldKey1}={value1}&{modelKey}.{fieldKey2}={value2}`,
    parameters: [
      {
        type: 'number',
        name: '_offset',
        in: 'query',
        description: '数据偏移量',
        default: 0,
      },
      {
        type: 'number',
        name: '_length',
        in: 'query',
        description: '数据长度，最大值 10000',
        default: 100,
      },
    ] as SwaggerParameter[],
  },
  /**
   * @deprecated
   */
  DataAppRecordPageDataSearch: {
    method: 'POST',
    route: '/api/data-app/v1/data-model/:modelKey/query',
    description: '获取应用分页数据(支持复杂条件传递)',
    parameters: [...makeSwaggerBodyDataParameters(DataAppSwaggerModelData.Swagger_FilterParams)] as SwaggerParameter[],
  },
  DataAppRecordPageDataGetV2: {
    method: 'GET',
    route: '/api/data-app/v2/data-model/:modelKey/record',
    description: '获取应用分页数据',
    detailInfo: `Query Parameters 中可传递筛选参数，格式示例: {modelKey}.{fieldKey1}={value1}&{modelKey}.{fieldKey2}={value2}`,
    parameters: [
      {
        type: 'number',
        name: '_offset',
        in: 'query',
        description: '数据偏移量',
        default: 0,
      },
      {
        type: 'number',
        name: '_length',
        in: 'query',
        description: '数据长度，最大值 10000',
        default: 100,
      },
    ] as SwaggerParameter[],
  },
  DataAppRecordPageDataSearchV2: {
    method: 'POST',
    route: '/api/data-app/v2/data-model/:modelKey/query',
    description: '获取应用分页数据(支持复杂条件传递)',
    parameters: [...makeSwaggerBodyDataParameters(DataAppSwaggerModelData.Swagger_FilterParams)] as SwaggerParameter[],
  },
  DataAppRecordCreate: {
    method: 'POST',
    route: '/api/data-app/v1/data-model/:modelKey/record',
    description: '创建应用数据',
    parameters: [
      {
        name: 'bodyData',
        type: 'object',
        in: 'body',
        description: dataPostInfoStr,
        schema: buildSwaggerSchema({ fieldKey1: 'fieldValue1', fieldKey2: 'fieldValue2' }),
      },
    ] as SwaggerParameter[],
  },
  DataAppRecordForcePut: {
    method: 'PUT',
    route: '/api/data-app/v1/data-model/:modelKey/record',
    description: '创建应用数据(强制更新)',
    parameters: [
      {
        name: 'bodyData',
        type: 'object',
        in: 'body',
        description: dataPostInfoStr,
        schema: buildSwaggerSchema({ fieldKey1: 'fieldValue1', fieldKey2: 'fieldValue2' }),
      },
    ] as SwaggerParameter[],
  },
  DataAppRecordUpdate: {
    method: 'PUT',
    route: '/api/data-app/v1/data-model/:modelKey/record/:dataId',
    description: '更新应用数据记录',
    parameters: [
      {
        name: 'bodyData',
        type: 'object',
        in: 'body',
        description: dataPostInfoStr,
        schema: buildSwaggerSchema({ fieldKey1: 'fieldValue1', fieldKey2: 'fieldValue2' }),
      },
    ] as SwaggerParameter[],
  },
  DataAppRecordDelete: {
    method: 'DELETE',
    route: '/api/data-app/v1/data-model/:modelKey/record/:dataId',
    description: '删除应用数据记录',
  },
  DataAppRecordsBatchUpsert: {
    method: 'POST',
    route: '/api/data-app/v1/data-model/:modelKey/batch-upsert',
    description: '批量创建/更新应用数据',
    detailInfo: '批量创建/更新具备事务性',
    parameters: [
      {
        name: 'bodyData',
        type: 'array',
        in: 'body',
        description: dataPostInfoStr,
        schema: buildSwaggerSchema([{ fieldKey1: 'fieldValue1', fieldKey2: 'fieldValue2' }]),
      },
    ] as SwaggerParameter[],
  },
  ModelDataInfoGet: {
    method: 'GET',
    route: '/api/data-app/v1/data-model/:modelKey/data/:uniqueFieldKey/:fieldValue',
    description: '获取模型指定数据信息',
    detailInfo: 'uniqueFieldKey 必须具备唯一索引',
  },
  ModelDataExistsCheck: {
    method: 'POST',
    route: '/api/data-app/v1/data-model/:modelKey/data/:uniqueFieldKey/:fieldValue/check-exists',
    description: '检查记录是否存在',
    detailInfo: 'uniqueFieldKey 必须具备唯一索引',
  },
}

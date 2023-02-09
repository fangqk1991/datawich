import { SwaggerModelDefinitionV2, TypicalSwaggerModel } from '@fangcha/swagger'
import { CommonSwaggerSchema } from './CommonSwaggerSchema'
import { FilterCondition } from '@fangcha/datawich-service'

export const DataAppSwaggerModelData = {
  FilterSymbol: {
    name: 'FilterSymbol',
    schema: CommonSwaggerSchema.FilterSymbol,
  } as SwaggerModelDefinitionV2,
  Swagger_FilterCondition: {
    name: 'Swagger_FilterCondition',
    schema: {
      type: 'object',
      required: ['leftKey', 'symbol', 'rightValue'],
      properties: {
        leftKey: {
          type: 'string',
          description: '左值',
          example: 'model_key_1.field_key_1',
        },
        symbol: CommonSwaggerSchema.FilterSymbol,
        rightValue: {
          // type: 'string',
          description: '右值，符号为 IN 时请传递数组',
          example: '1',
        },
      },
    },
  } as TypicalSwaggerModel<FilterCondition>,
  Swagger_FilterParams: {
    name: 'Swagger_FilterParams',
    schema: {
      type: 'object',
      properties: {
        conditions: {
          type: 'array',
          items: {
            $ref: '#/definitions/Swagger_FilterCondition',
          },
        },
        _offset: {
          type: 'number',
          description: '数据偏移量',
          default: 0,
        },
        _length: {
          type: 'number',
          description: '数据长度，最大值 10000',
          default: 100,
        },
      },
    },
  } as SwaggerModelDefinitionV2,
}

export const DataAppSwaggerModelList: SwaggerModelDefinitionV2[] = Object.keys(DataAppSwaggerModelData).map(
  (key) => DataAppSwaggerModelData[key]
)

import { SwaggerDocItem } from '@fangcha/router'
import { DataAppSwaggerModelList } from '@fangcha/datawich-service'
import { OpenDataModelSpecs } from './OpenDataModelSpecs'
import { OpenDataAppSpecs } from './OpenDataAppSpecs'
import { OpenProfileSpecs } from './OpenProfileSpecs'
import { OpenPanelSpecs } from './OpenPanelSpecs'

export const DatawichOpenSwaggerDocItems: SwaggerDocItem[] = [
  {
    name: '数据上报应用',
    pageURL: '/api-docs/v1/data-app',
    specs: OpenDataAppSpecs,
    models: DataAppSwaggerModelList,
  },
  {
    name: '模型相关方法',
    pageURL: '/api-docs/v1/data-model',
    specs: OpenDataModelSpecs,
  },
  {
    name: 'Profile',
    pageURL: '/api-docs/v1/profile',
    specs: OpenProfileSpecs,
  },
  {
    name: 'Panel',
    pageURL: '/api-docs/v1/panel',
    specs: OpenPanelSpecs,
  },
]

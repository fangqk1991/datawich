import { SwaggerDocItem } from '@fangcha/router'
import { DatabaseSpecs } from './DatabaseSpecs'

export const DatabaseDocItem: SwaggerDocItem = {
  name: 'Database',
  pageURL: '/api-docs/v1/database',
  specs: DatabaseSpecs,
}

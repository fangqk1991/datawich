import { SwaggerDocItem } from '@fangcha/router'
import { ConnectionSpecs } from './ConnectionSpecs'

export const DatabaseDocItem: SwaggerDocItem = {
  name: 'Database',
  pageURL: '/api-docs/v1/db-connection',
  specs: [...ConnectionSpecs],
}

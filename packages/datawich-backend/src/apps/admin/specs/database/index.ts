import { SwaggerDocItem } from '@fangcha/router'
import { ConnectionSpecs } from './ConnectionSpecs'
import { DBDataSpecs } from './DBDataSpecs'

export const DatabaseDocItem: SwaggerDocItem = {
  name: 'Database',
  pageURL: '/api-docs/v1/database',
  specs: [...ConnectionSpecs, ...DBDataSpecs],
}

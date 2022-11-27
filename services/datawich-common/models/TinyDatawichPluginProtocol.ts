import { Raw_ModelField } from './auto-build'
import { DescribableField } from './field'

export interface TinyDatawichPluginProtocol {
  onFieldInfosMade?: (field: Raw_ModelField, describableFields: DescribableField[]) => void
}

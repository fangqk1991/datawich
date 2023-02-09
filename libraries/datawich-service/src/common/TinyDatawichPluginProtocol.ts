import { DescribableField, Raw_ModelField } from './models'

export interface TinyDatawichPluginProtocol {
  onFieldInfosMade?: (field: Raw_ModelField, describableFields: DescribableField[]) => void
}

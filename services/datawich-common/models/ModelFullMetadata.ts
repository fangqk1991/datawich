import { FieldGroupModel, FieldIndexModel, Raw_FieldLink, Raw_ModelField } from './auto-build'
import { DataModelModel } from './model'

export interface ModelFullMetadata {
  modelKey: string
  tagName?: string
  description?: string
  systemVersion: string
  dataModel: DataModelModel
  modelFields: Raw_ModelField[]
  fieldLinks: Raw_FieldLink[]
  fieldIndexes: FieldIndexModel[]
  fieldGroups: FieldGroupModel[]
}

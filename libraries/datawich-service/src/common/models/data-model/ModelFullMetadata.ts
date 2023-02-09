import { FieldGroupModel, FieldIndexModel, Raw_FieldLink, Raw_ModelField } from '../field'
import { DataModelModel } from './DataModelModel'

export interface ModelMilestoneModel {
  uid: string
  modelKey: string
  tagName: string
  description: string
  metadataStr: string
  createTime: string
}

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

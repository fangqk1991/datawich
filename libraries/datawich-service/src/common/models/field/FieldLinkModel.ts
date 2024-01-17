import { ModelFieldModel } from './ModelFieldModel'
import { LinkMapperInfo } from './LinkMapperInfo'

export interface FieldLinkParams {
  modelKey: string
  fieldKey: string
  refModel: string
  refField: string
  isForeignKey: number
  isInline: number
  referenceCheckedInfos: LinkMapperInfo[]
}

export interface FieldLinkModel extends FieldLinkParams {
  linkId: string
  modelKey: string
  fieldKey: string
  refModel: string
  refField: string
  isForeignKey: number
  isInline: number
  fkName: string
  onUpdateAction: string
  onDeleteAction: string
  extrasInfo: string
  createTime: string
  updateTime: string
  referenceCheckedInfos: LinkMapperInfo[]
  referenceFields: ModelFieldModel[]
}

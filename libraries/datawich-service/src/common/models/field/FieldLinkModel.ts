import { ModelFieldModel } from './ModelFieldModel'
import { LinkMapperInfo } from './LinkMapperInfo'

export interface FieldLinkModel {
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

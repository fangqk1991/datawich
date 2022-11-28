import {
  ActionPerformInfo,
  FieldActionModel,
  FieldLinkModel,
  ModelFieldModel,
} from '@web/datawich-common/models'
import { SelectOption } from '@fangcha/tools'

export interface GeneralDataProtocol {
  showDataAppRecordActionPerformerInfo: (
    dataId: string,
    field: ModelFieldModel,
    action: FieldActionModel
  ) => Promise<ActionPerformInfo>
  searchDataAppFieldInfos: (modelKey: string, fieldKey: string, keywords?: string) => Promise<any[]>
  getDataModelFieldLinkList: (modelKey: string) => Promise<FieldLinkModel[]>
  searchDataAppFieldLinkInfos: (modelKey: string, linkId: string, keywords?: string) => Promise<SelectOption[]>
  searchDataAppProjectInfos: (modelKey: string, keywords?: string) => Promise<any[]>
  updateDataAppRecord: (modelKey: string, dataId: string, params: {}) => Promise<void>
}

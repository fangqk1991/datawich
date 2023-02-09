import { FieldType, ModelFieldModel } from '@fangcha/datawich-service'
import Vue from 'vue'
import { AttachmentDataColumn } from './AttachmentDataColumn'
import { AttachmentFormItem } from './AttachmentFormItem'
import { FieldPluginProtocol } from '../../core'
import { GeneralDataHelper } from '@fangcha/datawich-service'

export class AttachmentFieldPlugin implements FieldPluginProtocol {
  fieldType = FieldType.Attachment
  columnView = AttachmentDataColumn
  formItemView = AttachmentFormItem

  public onFormDataChanged(vue: Vue, data: any, field: ModelFieldModel) {
    if (data[field.fieldKey]) {
      vue.$set(data, GeneralDataHelper.attachmentEntityKey(field), JSON.parse(data[field.fieldKey]))
    } else {
      vue.$set(data, GeneralDataHelper.attachmentEntityKey(field), null)
    }
  }
}

import { FieldType } from '../field/FieldType'
import { SelectOption } from '@fangcha/tools'
import { ModelFieldModel } from '../field/ModelFieldModel'
import { OpenLevel } from './OpenLevel'
import {
  FieldEnumType,
  FieldNumberType,
  FieldObjectType,
  FieldStringType,
  FormField,
  FormFieldType,
} from '@fangcha/form-models'

export interface DBConnection {
  uid: string
  dbHost: string
  dbPort: number
  dbName: string
  username: string
  password: string
}

export interface DBTableFieldsExtras {
  [fieldKey: string]: Partial<FormField>
}

export interface DBTableExtrasParams {
  name: string
  openLevel: OpenLevel
  fieldsExtras: DBTableFieldsExtras
}

export interface DBTableExtras extends DBTableExtrasParams {
  uid: string
  connectionId: string
  tableId: string
}

export interface DBSchema extends DBConnection {
  tableIds: string[]
}

export interface DBTable extends DBTableExtrasParams {
  tableId: string
  primaryKey: string
  fields: FormField[]
  name: string
  openLevel: OpenLevel
  fieldsExtras: DBTableFieldsExtras
}

export interface DBTableField {
  fieldKey: string
  fieldType: FieldType
  name: string
  remarks: string
  nullable: boolean
  insertable: boolean
  modifiable: boolean
  hidden?: boolean
  isPrimary?: boolean
  isUUID?: boolean
  isAuthor?: boolean
  defaultValue?: any
  options?: SelectOption[]
}

export interface DBTypicalRecord {
  rid: number
  uid: string
  author: string
  created_at: string
  updated_at: string
}

export const transferModelFieldToFormField = (schemaField: ModelFieldModel) => {
  const commonField: FormField = {
    fieldKey: schemaField.fieldKey,
    fieldType: FormFieldType.String,
    name: schemaField.name,
    isRequired: !!schemaField.required,
    notVisible: schemaField.hidden || !!schemaField.isHidden,
    notInsertable: !!schemaField.isSystem,
    notModifiable: !!schemaField.isSystem,
    defaultValue: schemaField.useDefault ? schemaField.defaultValue : '',
    readonly: !!schemaField.isSystem,
    extras: {
      options: schemaField.options,
      value2LabelMap: schemaField.value2LabelMap,

      constraintKey: schemaField.extrasData.constraintKey,
      matchRegex: schemaField.extrasData.matchRegex,
      numberFormat: schemaField.extrasData.numberFormat,
      floatBits: schemaField.extrasData.floatBits,
      visibleLogic: schemaField.extrasData.visibleLogic,
      requiredLogic: schemaField.extrasData.requiredLogic,
      bigText: schemaField.extrasData.bigText,
    },
  }
  switch (schemaField.fieldType) {
    case FieldType.Integer:
      commonField.fieldType = FormFieldType.Number
      commonField.extras.numberType = FieldNumberType.Integer
      break
    case FieldType.Float:
      commonField.fieldType = FormFieldType.Number
      commonField.extras.numberType = FieldNumberType.Float
      break
    case FieldType.MultipleLinesText:
      commonField.fieldType = FormFieldType.String
      commonField.extras.multipleLines = true
      break
    case FieldType.JSON:
      commonField.extras.multipleLines = true
      commonField.fieldType = FormFieldType.String
      commonField.extras.stringType = FieldStringType.JSON
      break
    case FieldType.StringList:
      commonField.extras.multipleLines = true
      commonField.fieldType = FormFieldType.Object
      commonField.extras.objectType = FieldObjectType.StringList
      break
    case FieldType.Link:
      commonField.extras.multipleLines = true
      commonField.fieldType = FormFieldType.String
      commonField.extras.stringType = FieldStringType.Link
      break
    case FieldType.RichText:
      commonField.extras.multipleLines = true
      commonField.fieldType = FormFieldType.String
      commonField.extras.stringType = FieldStringType.RichText
      break
    case FieldType.CodeText:
      commonField.extras.multipleLines = true
      commonField.fieldType = FormFieldType.String
      commonField.extras.stringType = FieldStringType.CodeText
      break
    case FieldType.TextEnum:
      commonField.extras.enumType = FieldEnumType.Single
      break
    case FieldType.MultiEnum:
      commonField.extras.enumType = FieldEnumType.Multiple
      break
    case FieldType.Date:
      commonField.fieldType = FormFieldType.Date
      break
    case FieldType.Datetime:
      commonField.fieldType = FormFieldType.Datetime
      break
    case FieldType.Attachment:
      commonField.fieldType = FormFieldType.Object
      commonField.extras.objectType = FieldObjectType.Attachment
      break
  }
  return commonField
}

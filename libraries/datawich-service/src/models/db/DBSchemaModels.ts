import { FieldType } from '../field/FieldType'
import { SelectOption } from '@fangcha/tools'
import { CoreField, ModelFieldModel } from '../field/ModelFieldModel'
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
  [fieldKey: string]: Partial<DBTableField>
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
  fields: DBTableField[]
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

export const transferDBFieldToCore = (schemaField: DBTableField): CoreField => {
  return {
    fieldKey: schemaField.fieldKey,
    fieldType: schemaField.fieldType,
    name: schemaField.name,
    required: schemaField.nullable ? 0 : 1,
    extrasData: {} as any,
    defaultValue: schemaField.defaultValue,
    options: schemaField.options,
    value2LabelMap: (schemaField.options || []).reduce((result: any, cur: any) => {
      result[cur.value] = cur.label
      return result
    }, {}),
    hidden: schemaField.hidden,
  }
}

export const transferModelFieldToFormField = (schemaField: ModelFieldModel) => {
  const commonField: FormField = {
    fieldKey: schemaField.fieldKey,
    fieldType: FormFieldType.String,
    name: schemaField.name,
    isRequired: !!schemaField.required,
    notVisible: schemaField.hidden || !!schemaField.isHidden,
    defaultValue: schemaField.useDefault ? schemaField.defaultValue : '',
    extrasData: {
      options: schemaField.options,
      notInsertable: !!schemaField.isSystem,
      notModifiable: !!schemaField.isSystem,
      readonly: !!schemaField.isSystem,
    },
  }
  switch (schemaField.fieldType) {
    case FieldType.Integer:
      commonField.fieldType = FormFieldType.Number
      commonField.extrasData.numberType = FieldNumberType.Integer
      break
    case FieldType.Float:
      commonField.fieldType = FormFieldType.Number
      commonField.extrasData.numberType = FieldNumberType.Float
      break
    case FieldType.MultipleLinesText:
      commonField.fieldType = FormFieldType.String
      commonField.extrasData.multipleLines = true
      break
    case FieldType.JSON:
      commonField.extrasData.multipleLines = true
      commonField.fieldType = FormFieldType.Object
      commonField.extrasData.objectType = FieldObjectType.JSON
      break
    case FieldType.StringList:
      commonField.extrasData.multipleLines = true
      commonField.fieldType = FormFieldType.Object
      commonField.extrasData.objectType = FieldObjectType.StringList
      break
    case FieldType.Link:
      commonField.extrasData.multipleLines = true
      commonField.fieldType = FormFieldType.String
      commonField.extrasData.stringType = FieldStringType.Link
      break
    case FieldType.RichText:
      commonField.extrasData.multipleLines = true
      commonField.fieldType = FormFieldType.String
      commonField.extrasData.stringType = FieldStringType.RichText
      break
    case FieldType.CodeText:
      commonField.extrasData.multipleLines = true
      commonField.fieldType = FormFieldType.String
      commonField.extrasData.stringType = FieldStringType.CodeText
      break
    case FieldType.TextEnum:
      commonField.extrasData.enumType = FieldEnumType.Single
      break
    case FieldType.MultiEnum:
      commonField.extrasData.enumType = FieldEnumType.Multiple
      break
    case FieldType.Date:
      commonField.fieldType = FormFieldType.Date
      break
    case FieldType.Datetime:
      commonField.fieldType = FormFieldType.Datetime
      break
    case FieldType.Attachment:
      commonField.fieldType = FormFieldType.Object
      commonField.extrasData.objectType = FieldObjectType.Attachment
      break
  }
  return commonField
}

export const transferDBFieldToFormField = (schemaField: DBTableField) => {
  const commonField: FormField = {
    fieldKey: schemaField.fieldKey,
    fieldType: FormFieldType.String,
    name: schemaField.name,
    isRequired: !schemaField.nullable,
    notVisible: schemaField.hidden,
    defaultValue: schemaField.defaultValue,
    extrasData: {
      options: schemaField.options,
      notInsertable: !schemaField.insertable,
      notModifiable: !schemaField.modifiable,
    },
  }
  switch (schemaField.fieldType) {
    case FieldType.Integer:
      commonField.fieldType = FormFieldType.Number
      commonField.extrasData.numberType = FieldNumberType.Integer
      break
    case FieldType.Float:
      commonField.fieldType = FormFieldType.Number
      commonField.extrasData.numberType = FieldNumberType.Float
      break
    case FieldType.MultipleLinesText:
      commonField.fieldType = FormFieldType.String
      commonField.extrasData.multipleLines = true
      break
    case FieldType.JSON:
      commonField.extrasData.multipleLines = true
      commonField.fieldType = FormFieldType.Object
      commonField.extrasData.objectType = FieldObjectType.JSON
      break
    case FieldType.StringList:
      commonField.extrasData.multipleLines = true
      commonField.fieldType = FormFieldType.Object
      commonField.extrasData.objectType = FieldObjectType.StringList
      break
    case FieldType.Link:
      commonField.extrasData.multipleLines = true
      commonField.fieldType = FormFieldType.String
      commonField.extrasData.stringType = FieldStringType.Link
      break
    case FieldType.RichText:
      commonField.extrasData.multipleLines = true
      commonField.fieldType = FormFieldType.String
      commonField.extrasData.stringType = FieldStringType.RichText
      break
    case FieldType.CodeText:
      commonField.extrasData.multipleLines = true
      commonField.fieldType = FormFieldType.String
      commonField.extrasData.stringType = FieldStringType.CodeText
      break
    case FieldType.TextEnum:
      commonField.extrasData.enumType = FieldEnumType.Single
      break
    case FieldType.MultiEnum:
      commonField.extrasData.enumType = FieldEnumType.Multiple
      break
    case FieldType.Date:
      commonField.fieldType = FormFieldType.Date
      break
    case FieldType.Datetime:
      commonField.fieldType = FormFieldType.Datetime
      break
    case FieldType.Attachment:
      commonField.fieldType = FormFieldType.Object
      commonField.extrasData.objectType = FieldObjectType.Attachment
      break
  }
  return commonField
}

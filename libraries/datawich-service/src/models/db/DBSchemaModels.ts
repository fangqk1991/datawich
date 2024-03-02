import { FieldType } from '../field/FieldType'
import { SelectOption } from '@fangcha/tools'
import { CoreField } from '../field/ModelFieldModel'
import { OpenLevel } from './OpenLevel'

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
  }
}

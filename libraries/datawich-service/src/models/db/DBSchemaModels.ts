import { FieldType } from '../field/FieldType'

export interface DBTable {
  tableName: string
  fields: DBTableField[]
}

export interface DBTableField {
  fieldKey: string
  fieldType: FieldType
  name: string
  nullable: boolean
  insertable: boolean
  modifiable: boolean
  defaultValue?: any
}

export interface DBTypicalRecord {
  rid: number
  uid: string
  author: string
  created_at: string
  updated_at: string
}

import { FieldType, FieldTypeDescriptor } from '../field/FieldType'
import { BoolOptions, SelectOption } from '@fangcha/tools'
import { CoreField, TinyCoreField } from '../field/ModelFieldModel'
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
  hidden?: boolean
  isPrimary?: boolean
  isUUID?: boolean
  isAuthor?: boolean
  defaultValue?: any
  options?: SelectOption[]
}

export interface FlexSchema {
  name?: string
  fields: TinyCoreField[]
}

export type FlexSchemaFieldMap = { [key in keyof DBTableField]: FieldType | Omit<TinyCoreField, 'fieldKey'> }

const DBTableFieldMap: FlexSchemaFieldMap = {
  fieldKey: { fieldType: FieldType.SingleLineText, name: '字段 Key', extrasData: { readonly: true } },
  fieldType: { fieldType: FieldType.TextEnum, name: '字段类型', options: FieldTypeDescriptor.options() },
  name: { fieldType: FieldType.SingleLineText, name: '名称' },
  remarks: { fieldType: FieldType.SingleLineText, name: '备注' },
  nullable: { fieldType: FieldType.TextEnum, options: BoolOptions },
  insertable: { fieldType: FieldType.TextEnum, options: BoolOptions },
  modifiable: { fieldType: FieldType.TextEnum, options: BoolOptions },
}

export const Schema_DBTableField: FlexSchema = {
  name: '字段属性',
  fields: Object.keys(DBTableFieldMap).map((fieldKey) => {
    const props: TinyCoreField =
      typeof DBTableFieldMap[fieldKey] === 'string'
        ? {
            fieldType: DBTableFieldMap[fieldKey],
          }
        : DBTableFieldMap[fieldKey]
    props.fieldKey = fieldKey
    props.name = props.name || fieldKey
    return props
  }),
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

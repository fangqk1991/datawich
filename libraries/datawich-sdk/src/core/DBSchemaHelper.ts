import { DBTable, DBTableField, FieldType } from '@fangcha/datawich-service'
import { DBColumn, DBTableHandler, FCDatabase } from 'fc-sql'

export class DBSchemaHelper {
  public static async getTableSchema(
    database: FCDatabase,
    table: string,
    fieldsExtras: { [fieldKey: string]: Partial<DBTableField> } = {}
  ) {
    const handler = new DBTableHandler(database, table)
    const columns = await handler.getColumns()
    const schema: DBTable = {
      tableName: table,
      fields: columns.map((item) => this.makeTableField(item, fieldsExtras[item.Field])),
    }
    return schema
  }

  public static makeTableField(column: DBColumn, extras: Partial<DBTableField> = {}): DBTableField {
    const field: DBTableField = {
      fieldKey: column.Field,
      fieldType: FieldType.SingleLineText,
      name: column.Field,
      remarks: column.Comment || '',
      nullable: column.Null === 'YES',
      insertable: true,
      modifiable: true,
      defaultValue: column.Default,
    }

    if (column.Extra.includes('auto_increment') || (column.Field === 'uid' && column.Type === 'char(32)')) {
      field.insertable = false
      field.modifiable = false
    }

    if (column.Type.includes('int')) {
      field.fieldType = FieldType.Integer
    } else if (column.Type.includes('float') || column.Type.includes('double')) {
      field.fieldType = FieldType.Float
    } else if (column.Type.includes('date')) {
      field.fieldType = FieldType.Date
    } else if (column.Type.includes('timestamp') || column.Type.includes('datetime')) {
      field.fieldType = FieldType.Datetime
    } else if (column.Type.includes('text')) {
      field.fieldType = FieldType.MultipleLinesText
    }

    if (
      (field.fieldType === FieldType.Date || field.fieldType === FieldType.Datetime) &&
      field.defaultValue === 'CURRENT_TIMESTAMP'
    ) {
      field.defaultValue = null
      field.insertable = false
      field.modifiable = false
      // if (column.Extra.includes('on update CURRENT_TIMESTAMP')) {
      //   field.modifiable = false
      // }
    }
    if ((field.fieldType === FieldType.Integer || field.fieldType === FieldType.Float) && field.defaultValue !== null) {
      field.defaultValue = Number(field.defaultValue)
    }
    return {
      ...field,
      ...extras,
    }
  }
}

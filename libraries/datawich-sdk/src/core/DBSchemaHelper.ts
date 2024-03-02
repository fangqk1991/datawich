import { DBTable, DBTableExtrasParams, DBTableField, FieldType } from '@fangcha/datawich-service'
import { DBColumn, DBTableHandler, FCDatabase } from 'fc-sql'

export class DBSchemaHelper {
  public static async getTableSchema(database: FCDatabase, tableId: string, extras?: DBTableExtrasParams) {
    extras = extras || {
      name: '',
      isPrivate: false,
      fieldsExtras: {},
    }
    const fieldsExtras = extras.fieldsExtras || {}
    const handler = new DBTableHandler(database, tableId)
    const columns = await handler.getColumns()
    const indexes = await handler.getIndexes()
    const primaryIndex = indexes.find((item) => item.indexKey === 'PRIMARY' && item.columns.length === 1)
    const schema: DBTable = {
      tableId: tableId,
      primaryKey: primaryIndex ? primaryIndex.columns[0] : '',
      fields: columns.map((item) =>
        this.makeTableField(item, {
          ...fieldsExtras[item.Field],
          isPrimary: primaryIndex && primaryIndex.columns[0] === item.Field,
        })
      ),
      name: extras.name || tableId,
      isPrivate: extras.isPrivate || false,
      fieldsExtras: fieldsExtras,
    }
    return schema
  }

  public static makeTableField(column: DBColumn, extras: Partial<DBTableField> = {}): DBTableField {
    const field: DBTableField = {
      fieldKey: column.Field,
      fieldType: FieldType.SingleLineText,
      name: column.Comment && column.Comment.length <= 4 ? column.Comment : column.Field,
      remarks: column.Comment || '',
      nullable: column.Null === 'YES',
      insertable: true,
      modifiable: true,
      isPrimary: false,
      isUUID: false,
      isAuthor: false,
      defaultValue: column.Default,
    }

    if (column.Extra.includes('auto_increment')) {
      field.insertable = false
      field.modifiable = false
    }
    if (column.Field === 'uid' && column.Type === 'char(32)') {
      field.insertable = false
      field.modifiable = false
      field.isUUID = true
    }
    if (column.Field === 'author') {
      field.insertable = false
      field.modifiable = false
      field.isAuthor = true
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
    } else if (column.Type.startsWith('enum')) {
      const items = [...column.Type.matchAll(/'(\w+)'/g)].map((item) => item[1])
      field.fieldType = FieldType.TextEnum
      field.options = items.map((val) => ({ label: val, value: val }))
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

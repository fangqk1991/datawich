import { DBTable, DBTableExtrasParams, OpenLevel } from '@fangcha/datawich-service'
import { DBColumn, DBTableHandler, FCDatabase } from 'fc-sql'
import { FieldEnumType, FieldNumberType, FormField, FormFieldType } from '@fangcha/form-models'

export class DBSchemaHelper {
  public static async getTableSchema(database: FCDatabase, tableId: string, extras?: DBTableExtrasParams) {
    extras = extras || {
      name: '',
      openLevel: OpenLevel.None,
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
      openLevel: extras.openLevel,
      fieldsExtras: fieldsExtras,
    }
    return schema
  }

  public static makeTableField(column: DBColumn, extensions: Partial<FormField> = {}): FormField {
    const field: FormField = {
      fieldKey: column.Field,
      fieldType: FormFieldType.String,
      name: column.Comment && column.Comment.length <= 4 ? column.Comment : column.Field,
      isRequired: column.Null !== 'YES',
      defaultValue: column.Default || '',
      extras: {
        remarks: column.Comment || '',
      },
    }

    if (column.Extra.includes('auto_increment')) {
      field.notInsertable = true
      field.notModifiable = true
    }
    if (column.Field === 'uid' && column.Type === 'char(32)') {
      field.notInsertable = true
      field.notModifiable = true
      field.extras.isUUID = true
    }
    if (column.Field === 'author') {
      field.notInsertable = true
      field.notModifiable = true
      field.extras.isAuthor = true
    }

    if (column.Type.includes('int')) {
      field.fieldType = FormFieldType.Number
      field.extras.numberType = FieldNumberType.Integer
    } else if (column.Type.includes('float') || column.Type.includes('double')) {
      field.fieldType = FormFieldType.Number
      field.extras.numberType = FieldNumberType.Float
    } else if (column.Type.includes('date')) {
      field.fieldType = FormFieldType.Date
    } else if (column.Type.includes('timestamp') || column.Type.includes('datetime')) {
      field.fieldType = FormFieldType.Datetime
    } else if (column.Type.includes('text')) {
      field.fieldType = FormFieldType.String
      field.extras.multipleLines = true
    } else if (column.Type.startsWith('enum')) {
      const items = [...column.Type.matchAll(/'(\w+)'/g)].map((item) => item[1])
      field.fieldType = FormFieldType.String
      field.extras.enumType = FieldEnumType.Single
      field.extras.options = items.map((val) => ({ label: val, value: val }))
    }

    if (
      (field.fieldType === FormFieldType.Date || field.fieldType === FormFieldType.Datetime) &&
      field.defaultValue === 'CURRENT_TIMESTAMP'
    ) {
      field.defaultValue = null
      field.notInsertable = true
      field.notModifiable = true
      // if (column.Extra.includes('on update CURRENT_TIMESTAMP')) {
      //   field.modifiable = false
      // }
    }
    if (
      field.fieldType === FormFieldType.Number &&
      field.defaultValue !== null &&
      /^\d+$/.test(`${field.defaultValue}`)
    ) {
      field.defaultValue = Number(field.defaultValue)
    }
    return {
      ...field,
      ...extensions,
      extras: {
        ...field.extras,
        ...(extensions.extras || {}),
      },
    }
  }
}

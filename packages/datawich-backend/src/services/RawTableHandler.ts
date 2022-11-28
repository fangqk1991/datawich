import { DBTableHandler } from 'fc-sql'
import { FieldType, ModelFieldModel } from '@fangcha/datawich-service/lib/common/models'
import { _DataModel } from '../models/extensions/_DataModel'

export class RawTableHandler extends DBTableHandler {
  public async injectFieldsToDataModel(dataModel: _DataModel) {
    const fields = await this.transferColumnsToModelFields()
    for (const params of fields) {
      await dataModel.createField(params)
    }
  }

  public async transferColumnsToModelFields() {
    const columns = await this.getColumns()
    const retainKeysSet = new Set([
      'rid',
      'data_id',
      'model_key',
      'ignore',
      'author',
      'update_author',
      'create_time',
      'update_time',
    ])
    const todoColumns = columns.filter((item) => !retainKeysSet.has(item.Field) && !/^_/.test(item.Field))
    return todoColumns.map((column) => {
      const fieldParams: Partial<ModelFieldModel> = {}
      fieldParams.fieldKey = column.Field
      fieldParams.fieldType = FieldType.SingleLineText
      fieldParams.name = column.Field
      fieldParams.useDefault = 0
      fieldParams.defaultValue = column.Default || ''
      fieldParams.star = 0
      fieldParams.isSystem = 0
      fieldParams.remarks = column.Comment || ''
      fieldParams.inputHint = ''
      fieldParams.extrasInfo = JSON.stringify({})
      // fieldParams.required = column.Null === 'NO' ? 1 : 0
      fieldParams.required = 0
      if (column.Key === 'PRI' || column.Key === 'UNI') {
        fieldParams.isUnique = 1
      }
      const rawColType = column.Type
      if (rawColType.includes('int')) {
        fieldParams.fieldType = FieldType.Integer
      } else if (rawColType.includes('float') || rawColType.includes('double')) {
        fieldParams.fieldType = FieldType.Float
      } else if (rawColType === 'timestamp' || rawColType === 'datetime') {
        fieldParams.fieldType = FieldType.Datetime
      } else if (rawColType === 'date') {
        fieldParams.fieldType = FieldType.Date
      } else if (rawColType.includes('text')) {
        fieldParams.fieldType = FieldType.MultipleLinesText
      }
      return fieldParams as ModelFieldModel
    })
  }
}

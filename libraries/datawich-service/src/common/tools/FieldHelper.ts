import { addSlashes, SelectOption } from '@fangcha/tools'
import { DescribableField, FieldsDisplaySettings, FieldType, ModelFieldModel, Raw_ModelField } from '../models'
import { GeneralDataHelper } from './GeneralDataHelper'

export class FieldHelper {
  public static getFieldTypeDatabaseSpec(field: ModelFieldModel, beIndex = false) {
    const commentText = addSlashes(field.name)
    if (beIndex) {
      switch (field.fieldType) {
        case FieldType.SingleLineText:
          return `VARCHAR(127) NOT NULL DEFAULT '' COMMENT '${commentText}'`
      }
    }
    switch (field.fieldType) {
      case FieldType.Integer:
        return `BIGINT NULL COMMENT '${commentText}'`
      case FieldType.Float:
        return `DOUBLE NULL COMMENT '${commentText}'`
      case FieldType.SingleLineText:
        return `VARCHAR(1023) NULL DEFAULT '' COMMENT '${commentText}'`
      case FieldType.MultipleLinesText:
      case FieldType.JSON:
      case FieldType.StringList:
      case FieldType.Link:
        return `TEXT COMMENT '${commentText}'`
      case FieldType.RichText:
        return `MEDIUMTEXT COMMENT '${commentText}'`
      case FieldType.TextEnum:
        return `VARCHAR(127) NULL COMMENT '${commentText}'`
      case FieldType.MultiEnum:
        return `TEXT NULL COMMENT '${commentText}'`
      case FieldType.Date:
        return `DATE NULL COMMENT '${commentText}'`
      case FieldType.Datetime:
        return `TIMESTAMP NULL COMMENT '${commentText}'`
      case FieldType.ReadonlyText:
        return `VARCHAR(1023) NOT NULL DEFAULT '' COMMENT '${commentText}'`
      case FieldType.Attachment:
        return `TEXT COMMENT '${commentText}'`
      case FieldType.User:
        return `VARCHAR(127) NOT NULL DEFAULT '' COMMENT '${commentText}'`
    }
    return 'Unknown'
  }

  public static getFieldValueExample(field: DescribableField) {
    switch (field.fieldType as FieldType) {
      case FieldType.TextEnum: {
        const options = field.options as any[]
        if (options.length > 0) {
          return options[0].value
        }
        break
      }
      case FieldType.Integer:
      case FieldType.Float:
      case FieldType.Date:
        return '2000-01-01'
      case FieldType.Datetime:
        return '2020-01-01T00:00:00+08:00'
      case FieldType.Link:
        return 'https://google.com'
      case FieldType.JSON:
        return '{}'
      case FieldType.StringList:
        return '[]'
    }
    return 'Some Text'
  }

  public static getFieldNaturalLanguageValueExample(field: DescribableField) {
    switch (field.fieldType as FieldType) {
      case FieldType.TextEnum: {
        const options = field.options as any[]
        if (options.length > 0) {
          return options[0].label
        }
        break
      }
      case FieldType.MultiEnum: {
        const options = field.options as any[]
        const texts: string[] = []
        for (let i = 0; i < 2 && i < options.length; ++i) {
          texts.push(options[i].label)
        }
        return texts.join(', ')
      }
      case FieldType.Link:
        return 'https://google.com'
      case FieldType.JSON:
        return '{}'
      case FieldType.StringList:
        return '[]'
    }
    return FieldHelper.getFieldValueExample(field)
  }

  public static checkSearchableField(code: FieldType) {
    return [
      FieldType.SingleLineText,
      FieldType.MultipleLinesText,
      FieldType.StringList,
      FieldType.ReadonlyText,
    ].includes(code)
  }

  public static checkExactSearchableField(code: FieldType) {
    return code === FieldType.User || FieldHelper.checkSearchableField(code)
  }

  public static checkCalculableField(code: FieldType) {
    return [FieldType.Integer, FieldType.Float].includes(code)
  }

  public static checkSpecialField(code: FieldType) {
    return [FieldType.RichText, FieldType.Attachment, FieldType.JSON, FieldType.StringList, FieldType.Link].includes(
      code
    )
  }

  public static checkIndexAbleField(code: FieldType | any) {
    return code !== FieldType.MultipleLinesText && !this.checkSpecialField(code)
  }

  public static extractDisplayFields(mainFields: ModelFieldModel[], displaySettings: FieldsDisplaySettings) {
    const checkedMap = displaySettings.checkedList.reduce((result, cur) => {
      result[cur] = true
      return result
    }, {})
    let displayItems = mainFields.filter((item) => !displaySettings.hiddenFieldsMap[item.filterKey])
    const fieldMap = displayItems.reduce((result, cur) => {
      result[cur.filterKey] = cur
      return result
    }, {})
    displayItems = [
      ...displaySettings.checkedList.map((filterKey) => fieldMap[filterKey]).filter((item) => !!item),
      ...displayItems.filter((item) => !checkedMap[item.filterKey]),
    ]
    return FieldHelper.makeDisplayFields(displayItems)
  }

  public static expandAllFields(mainFields: ModelFieldModel[]) {
    const items: ModelFieldModel[] = []
    for (const field of mainFields) {
      items.push(field)
      field.refFieldLinks.forEach((link) => {
        if (link.isInline) {
          items.push(...link.referenceFields)
        }
      })
    }
    return items
  }

  public static makeDisplayFields(fields: ModelFieldModel[]) {
    const groupFieldMap: { [p: string]: ModelFieldModel } = {}
    const displayFields: ModelFieldModel[] = []
    for (const field of fields) {
      if (!field.groupKey) {
        displayFields.push(field)
        continue
      }
      if (!groupFieldMap[field.groupKey]) {
        const groupField = {
          modelKey: field.groupKey,
          fieldKey: '',
          name: field.groupName,
          fieldType: FieldType.Group,
          fieldDisplayMode: field.fieldDisplayMode,
          fieldDisplayTmpl: field.fieldDisplayTmpl,
          groupName: field.groupName,
          groupFields: [],
        } as Partial<ModelFieldModel>
        groupFieldMap[field.groupKey] = groupField as ModelFieldModel
        displayFields.push(groupField as ModelFieldModel)
      }
      groupFieldMap[field.groupKey].groupFields!.push(field)
    }
    return displayFields
  }

  public static cleanDataByModelFields(data: any, modelFields: Raw_ModelField[] = []) {
    const realData: any = {}
    modelFields.forEach((field) => {
      for (const key of [field.fieldKey, GeneralDataHelper.entityKey(field.fieldKey)]) {
        if (key in data) {
          realData[key] = data[key]
          if (!realData[key]) {
            if (field.fieldType === FieldType.JSON) {
              realData[key] = '{}'
            } else if (field.fieldType === FieldType.StringList) {
              realData[key] = []
            }
          } else {
            if (field.fieldType === FieldType.StringList) {
              if (typeof realData[key] === 'string') {
                realData[key] = JSON.parse(realData[key])
              }
            }
          }
        }
      }
    })
    modelFields
      .filter(
        (field) =>
          [FieldType.Integer, FieldType.Float, FieldType.Date].includes(field.fieldType as FieldType) &&
          !field.required &&
          (realData[field.fieldKey] === '' || realData[field.fieldKey] === null)
      )
      .forEach((field) => {
        delete realData[field.fieldKey]
      })
    delete realData['create_time']
    delete realData['update_time']
    return realData
  }

  public static getFieldHint(field: { fieldType: FieldType; options: SelectOption[] }) {
    switch (field.fieldType as FieldType) {
      case FieldType.TextEnum: {
        const texts: string[] = []
        texts.push(`枚举项(单选)`)
        texts.push(...field.options.map((item: any) => item.label))
        return texts.join('\n')
      }
      case FieldType.MultiEnum: {
        const texts: string[] = []
        texts.push(`枚举项(多选)`)
        texts.push(...field.options.map((item: any) => item.label))
        return texts.join('\n')
      }
      case FieldType.Date:
        return 'yyyy-MM-dd'
      case FieldType.Datetime:
        return 'ISO 8601 时间'
    }
    return ''
  }
}
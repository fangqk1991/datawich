import { addSlashes, Descriptor, I18nLanguage } from '@fangcha/tools'
import { DescribableField, ModelFieldModel } from './ModelFieldModel'

export enum FieldType {
  Unknown = 'Unknown',
  Integer = 'Integer',
  Float = 'Float',
  SingleLineText = 'SingleLineText',
  MultipleLinesText = 'MultipleLinesText',
  JSON = 'JSON',
  RichText = 'RichText',
  /**
   * @deprecated
   */
  Enum = 'Enum',
  TextEnum = 'TextEnum',
  MultiEnum = 'MultiEnum',
  /**
   * @deprecated
   */
  Tags = 'Tags',
  Date = 'Date',
  Datetime = 'Datetime',
  ReadonlyText = 'ReadonlyText',
  Attachment = 'Attachment',
  User = 'User',
  // Group 仅临时作用于展示阶段，实际不会存储此类型字段
  Group = 'Group',
  Template = 'Template',
  Dummy = 'Dummy',
}

const values = [
  FieldType.Integer,
  FieldType.Float,
  FieldType.SingleLineText,
  FieldType.MultipleLinesText,
  FieldType.JSON,
  FieldType.RichText,
  FieldType.TextEnum,
  FieldType.MultiEnum,
  FieldType.Date,
  FieldType.Datetime,
  FieldType.Attachment,
]

const describe = (code: FieldType) => {
  switch (code) {
    case FieldType.Integer:
      return 'Integer Number Type'
    case FieldType.Float:
      return 'Float Number Type'
    case FieldType.SingleLineText:
      return 'Single Line Text'
    case FieldType.MultipleLinesText:
      return 'Multiple Lines Text'
    case FieldType.JSON:
      return 'JSON Text'
    case FieldType.RichText:
      return 'Rich Text'
    case FieldType.Enum:
      return 'Enumeration'
    case FieldType.TextEnum:
      return 'Text Enumeration'
    case FieldType.MultiEnum:
      return 'Multi Enumeration'
    case FieldType.Tags:
      return 'Tags'
    case FieldType.Date:
      return 'Date Type'
    case FieldType.Datetime:
      return 'Datetime Type'
    case FieldType.ReadonlyText:
      return 'Readonly Text'
    case FieldType.Attachment:
      return 'Attachment'
    case FieldType.User:
      return 'User'
  }
  return 'Unknown'
}

export const getFieldTypeDatabaseSpec = (field: ModelFieldModel, beIndex = false) => {
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
      return `TEXT COMMENT '${commentText}'`
    case FieldType.RichText:
      return `MEDIUMTEXT COMMENT '${commentText}'`
    case FieldType.Enum:
      return `INT NOT NULL DEFAULT 0 COMMENT '${commentText}'`
    case FieldType.TextEnum:
      return `VARCHAR(127) NULL COMMENT '${commentText}'`
    case FieldType.MultiEnum:
      return `TEXT NULL COMMENT '${commentText}'`
    case FieldType.Tags:
      return `BIGINT NOT NULL DEFAULT 0 COMMENT '${commentText}'`
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

export const getFieldValueExample = (field: DescribableField) => {
  switch (field.fieldType as FieldType) {
    case FieldType.TextEnum:
    case FieldType.Enum: {
      const options = field.options as any[]
      if (options.length > 0) {
        return options[0].value
      }
      break
    }
    case FieldType.Tags: {
      const options = field.options as any[]
      let value = 0
      for (let i = 0; i < 2 && i < options.length; ++i) {
        value += 1 << options[i].value
      }
      return value
    }
    case FieldType.Integer:
    case FieldType.Float:
    case FieldType.Date:
      return '2000-01-01'
    case FieldType.Datetime:
      return '2020-01-01T00:00:00+08:00'
    case FieldType.JSON:
      return '{}'
  }
  return 'Some Text'
}

export const getFieldNaturalLanguageValueExample = (field: DescribableField) => {
  switch (field.fieldType as FieldType) {
    case FieldType.TextEnum:
    case FieldType.Enum: {
      const options = field.options as any[]
      if (options.length > 0) {
        return options[0].label
      }
      break
    }
    case FieldType.MultiEnum:
    case FieldType.Tags: {
      const options = field.options as any[]
      const texts: string[] = []
      for (let i = 0; i < 2 && i < options.length; ++i) {
        texts.push(options[i].label)
      }
      return texts.join(', ')
    }
    case FieldType.JSON:
      return '{}'
  }
  return getFieldValueExample(field)
}

export const checkSearchableField = (code: FieldType) => {
  return [FieldType.SingleLineText, FieldType.MultipleLinesText, FieldType.ReadonlyText].includes(code)
}

export const checkExactSearchableField = (code: FieldType) => {
  return code === FieldType.User || checkSearchableField(code)
}

export const checkCalculableField = (code: FieldType) => {
  return [FieldType.Integer, FieldType.Float].includes(code)
}

export const checkFieldHasOptions = (code: any) => {
  return [FieldType.Enum, FieldType.Tags, FieldType.TextEnum, FieldType.MultiEnum].includes(code)
}

export const checkSpecialField = (code: FieldType) => {
  return [FieldType.RichText, FieldType.Attachment, FieldType.JSON].includes(code)
}

export const checkUniqueAbleField = (code: FieldType | any) => {
  return [FieldType.SingleLineText, FieldType.Integer].includes(code)
}

export const checkIndexAbleField = (code: FieldType | any) => {
  return ![FieldType.MultipleLinesText, FieldType.JSON, FieldType.RichText, FieldType.Attachment].includes(code)
}

const FieldTypeI18N = {
  'Integer Number Type': {
    en: `Integer Number`,
    zh: `整型数`,
  },
  'Float Number Type': {
    en: `Float Number`,
    zh: `浮点数`,
  },
  'Single Line Text': {
    en: `Single Line Text`,
    zh: `单行文本`,
  },
  'Multiple Lines Text': {
    en: `Multiple Lines Text`,
    zh: `多行文本`,
  },
  'Rich Text': {
    en: `Rich Text`,
    zh: `富文本`,
  },
  Enumeration: {
    en: `Enumeration`,
    zh: `枚举值`,
  },
  'Text Enumeration': {
    en: `Text Enumeration`,
    zh: `文本枚举`,
  },
  'Multi Enumeration': {
    en: `Multi Enumeration`,
    zh: `多选枚举`,
  },
  Tags: {
    en: `Tags`,
    zh: `标签`,
  },
  'Date Type': {
    en: `Date`,
    zh: `日期`,
  },
  'Datetime Type': {
    en: `Datetime`,
    zh: `时间`,
  },
  'Readonly Text': {
    en: `Readonly Text`,
    zh: `只读文本`,
  },
  Attachment: {
    en: `Attachment`,
    zh: `附件`,
  },
  'Foreign Key': {
    en: `Foreign Key`,
    zh: `外键`,
  },
  User: {
    en: `User`,
    zh: `用户`,
  },
}

export const FieldTypeDescriptor = new Descriptor(values, describe)
FieldTypeDescriptor.setI18nData(FieldTypeI18N, I18nLanguage.zh)

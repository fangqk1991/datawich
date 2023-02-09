import { Descriptor, I18nLanguage } from '@fangcha/tools'

export enum FieldType {
  Unknown = 'Unknown',
  Integer = 'Integer',
  Float = 'Float',
  SingleLineText = 'SingleLineText',
  MultipleLinesText = 'MultipleLinesText',
  JSON = 'JSON',
  StringList = 'StringList',
  Link = 'Link',
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
  FieldType.Link,
  FieldType.JSON,
  FieldType.StringList,
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
    case FieldType.Link:
      return 'Link'
    case FieldType.JSON:
      return 'JSON Text'
    case FieldType.StringList:
      return 'String List'
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

export const checkFieldHasOptions = (code: any) => {
  return [FieldType.Enum, FieldType.Tags, FieldType.TextEnum, FieldType.MultiEnum].includes(code)
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

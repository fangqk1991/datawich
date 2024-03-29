import { Descriptor } from '@fangcha/tools'

export enum FieldStringType {
  Normal = 'Normal',
  Link = 'Link',
  RichText = 'RichText',
  JSON = 'JSON',
  CodeText = 'CodeText',
}

const values = [
  FieldStringType.Normal,
  FieldStringType.Link,
  FieldStringType.RichText,
  FieldStringType.JSON,
  FieldStringType.CodeText,
]

const describe = (code: FieldStringType) => {
  switch (code) {
    case FieldStringType.Normal:
      return '常规'
    case FieldStringType.Link:
      return '链接'
    case FieldStringType.RichText:
      return '富文本'
    case FieldStringType.JSON:
      return 'JSON'
    case FieldStringType.CodeText:
      return '代码'
  }
  return code
}

export const FieldStringTypeDescriptor = new Descriptor(values, describe)

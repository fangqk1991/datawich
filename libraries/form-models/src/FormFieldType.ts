import { Descriptor, I18nLanguage } from '@fangcha/tools'

export enum FormFieldType {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  Date = 'Date',
  Datetime = 'Datetime',
  Object = 'Object',
}

const values = [
  FormFieldType.String,
  FormFieldType.Number,
  FormFieldType.Boolean,
  FormFieldType.Date,
  FormFieldType.Datetime,
  FormFieldType.Object,
]

const describe = (code: FormFieldType) => {
  return code
}

const FormFieldTypeI18N = {
  String: {
    en: `String`,
    zh: `字符串`,
  },
  Number: {
    en: `Number`,
    zh: `数值`,
  },
  Boolean: {
    en: `Boolean`,
    zh: `布尔值`,
  },
  Date: {
    en: `Date`,
    zh: `日期`,
  },
  Datetime: {
    en: `Datetime`,
    zh: `时间`,
  },
  Object: {
    en: `Object`,
    zh: `对象`,
  },
}

export const FormFieldTypeDescriptor = new Descriptor(values, describe)
FormFieldTypeDescriptor.setI18nData(FormFieldTypeI18N, I18nLanguage.zh)

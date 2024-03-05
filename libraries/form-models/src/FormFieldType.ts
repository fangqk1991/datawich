import { Descriptor, I18nLanguage } from '@fangcha/tools'

export enum FormFieldType {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  Null = 'Null',
  Object = 'Object',
}

const values = [
  FormFieldType.String,
  FormFieldType.Number,
  FormFieldType.Boolean,
  FormFieldType.Null,
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
  Null: {
    en: `Null`,
    zh: `空`,
  },
  Object: {
    en: `Object`,
    zh: `对象`,
  },
}

export const FormFieldTypeDescriptor = new Descriptor(values, describe)
FormFieldTypeDescriptor.setI18nData(FormFieldTypeI18N, I18nLanguage.zh)

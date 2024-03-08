import { Descriptor, I18nLanguage } from '@fangcha/tools'

export enum NumberFormat {
  Normal = 'Normal',
  Percent = 'Percent',
  Format = 'Format',
}

const values = [NumberFormat.Normal, NumberFormat.Percent, NumberFormat.Format]

const describe = (code: NumberFormat) => {
  switch (code) {
    case NumberFormat.Normal:
      return 'Normal'
    case NumberFormat.Percent:
      return 'Percent'
    case NumberFormat.Format:
      return 'Format'
  }
  return 'Normal'
}

const NumberFormatI18N = {
  Normal: {
    en: `Normal`,
    zh: `普通`,
  },
  Percent: {
    en: `Percent`,
    zh: `百分比`,
  },
  Format: {
    en: `Format`,
    zh: `格式化`,
  },
}

export const NumberFormatDescriptor = new Descriptor(values, describe)
NumberFormatDescriptor.setI18nData(NumberFormatI18N, I18nLanguage.zh)

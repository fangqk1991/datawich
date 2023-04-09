import i18next from 'i18next'
import { DatawichI18N } from '@web/datawich-common/i18n'

const resources = {
  en: {
    translation: {},
  },
  zh: {
    translation: {},
  },
}

const locales = Object.keys(resources)
Object.keys(DatawichI18N).forEach((key) => {
  const data = DatawichI18N[key]
  for (const locale of locales) {
    resources[locale].translation[key] = data[locale]
  }
})

i18next.init({
  lng: 'en',
  resources: resources,
})

export const ReactI18n = i18next

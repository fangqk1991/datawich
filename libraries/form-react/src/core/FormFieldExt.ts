import { FormField } from '@fangcha/form-models'
import React from 'react'

type UpdateData = (kvList: { fullKeys: string[]; value: any; field: FormField }[]) => void

interface Options {
  field: FormFieldExt
  myData: any
  editable: boolean
  updateData?: UpdateData
  devMode?: boolean
}

export interface FormFieldExt extends FormField {
  label?: React.ReactNode
  style?: React.CSSProperties
  customFormItem?: (options: Options) => React.ReactNode
}

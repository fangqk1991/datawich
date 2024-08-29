import { FormField } from '@fangcha/form-models'
import React from 'react'

type UpdateData = (kvList: { fullKeys: string[]; value: any }[]) => void

interface Options {
  field: FormFieldExt
  myData: any
  editable: boolean
  updateData?: UpdateData
  devMode?: boolean
  value: any
  fullKeys: string[]
}

export interface FormFieldExt extends FormField {
  label?: React.ReactNode
  style?: React.CSSProperties
  customFormItem?: (options: Options) => React.ReactNode
  descriptionItem?: (options: { field: FormFieldExt; myData: any }) => React.ReactNode
}

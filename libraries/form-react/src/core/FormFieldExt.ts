import { FormField } from '@fangcha/form-models'
import React from 'react'

export interface FormFieldExt extends FormField {
  label?: React.ReactNode
  style?: React.CSSProperties
}

import React from 'react'
import { ModelFieldModel, transferModelFieldToFormField } from '@fangcha/datawich-service'
import { DataColumnExtension } from './DataColumnExtension'
import { CommonDataCell } from '../core/CommonDataCell'

interface Props {
  field: ModelFieldModel
  data: any
}

export const MyDataCell: React.FC<Props> = (props) => {
  return (
    <CommonDataCell
      field={transferModelFieldToFormField(props.field)}
      data={props.data}
      extension={<DataColumnExtension field={props.field} data={props.data} />}
    />
  )
}

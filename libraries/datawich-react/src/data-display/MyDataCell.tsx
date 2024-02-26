import React from 'react'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { DataColumnExtension } from './DataColumnExtension'
import { CommonDataCell } from './CommonDataCell'

interface Props {
  field: ModelFieldModel
  data: any
}

export const MyDataCell: React.FC<Props> = (props) => {
  const field = props.field
  return (
    <CommonDataCell
      field={field}
      data={props.data}
      extension={<DataColumnExtension field={props.field} data={props.data} />}
    />
  )
}

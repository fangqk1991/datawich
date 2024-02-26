import React, { useMemo } from 'react'
import { GeneralDataHelper, ModelFieldModel } from '@fangcha/datawich-service'
import { DataColumnExtension } from './DataColumnExtension'
import { CommonDataCell } from './CommonDataCell'

interface Props {
  field: ModelFieldModel
  superField?: ModelFieldModel
  data: any
}

export const MyDataCell: React.FC<Props> = (props) => {
  const field = props.field
  const dataKey = useMemo(() => {
    return GeneralDataHelper.calculateDataKey(props.field, props.superField)
  }, [props.field, props.superField])
  return (
    <CommonDataCell
      field={field}
      dataKey={dataKey}
      data={props.data}
      extension={<DataColumnExtension field={props.field} superField={props.superField} data={props.data} />}
    />
  )
}

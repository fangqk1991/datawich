import React, { useMemo } from 'react'
import { GeneralDataHelper, ModelFieldModel } from '@fangcha/datawich-service'

interface Props {
  field: ModelFieldModel
  superField?: ModelFieldModel
  filterOptions?: any
  tagCheckedMap?: any
  data: any
}

export const MyDataColumn: React.FC<Props> = (props) => {
  const dataKey = useMemo(() => {
    return GeneralDataHelper.calculateDataKey(props.field, props.superField)
  }, [props.field, props.superField])
  return <div>{props.data[dataKey]}</div>
}

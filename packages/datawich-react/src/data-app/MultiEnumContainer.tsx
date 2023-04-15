import React from 'react'
import { GeneralDataHelper, ModelFieldModel } from '@fangcha/datawich-service'
import { MyTagsPanel } from '@fangcha/react'

interface Props {
  field: ModelFieldModel
  value: string
}

export const MultiEnumContainer: React.FC<Props> = (props) => {
  return (
    <MyTagsPanel
      inline={true}
      values={GeneralDataHelper.extractMultiEnumItems(props.value)}
      describeFunc={(value) => {
        return props.field.value2LabelMap[value]
      }}
      tagProps={{
        color: 'geekblue',
      }}
    />
  )
}

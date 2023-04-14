import React from 'react'
import { GeneralDataHelper } from '@fangcha/datawich-service'
import { SelectOption } from '@fangcha/tools'
import { MyTagsPanel } from './MyTagsPanel'

interface Props {
  options: SelectOption[]
  value: string
}

export const MultiEnumContainer: React.FC<Props> = (props) => {
  return (
    <MyTagsPanel
      inline={true}
      values={GeneralDataHelper.extractMultiEnumItems(props.value)}
      tagProps={{
        color: 'geekblue',
      }}
    />
  )
}

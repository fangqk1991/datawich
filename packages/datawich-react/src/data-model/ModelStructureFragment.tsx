import React from 'react'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'
import { ModelFieldTable } from './ModelFieldTable'
import { FieldLinkTable } from './FieldLinkTable'
import { Divider } from 'antd'

export const ModelStructureFragment: ModelFragmentProtocol = ({ dataModel }) => {
  return (
    <>
      <ModelFieldTable modelKey={dataModel.modelKey} />
      <Divider />
      <FieldLinkTable />
    </>
  )
}

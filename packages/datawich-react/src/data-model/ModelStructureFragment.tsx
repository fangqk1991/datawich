import React from 'react'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'
import { ModelFieldTable } from './ModelFieldTable'
import { FieldLinkTable } from './FieldLinkTable'

export const ModelStructureFragment: ModelFragmentProtocol = ({ dataModel }) => {
  return (
    <>
      <ModelFieldTable modelKey={dataModel.modelKey} />
      <FieldLinkTable />
    </>
  )
}

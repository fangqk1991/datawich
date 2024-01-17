import React from 'react'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'
import { ModelFieldTable } from '../model-field/ModelFieldTable'
import { FieldLinkTable } from '../field-link/FieldLinkTable'
import { Divider } from 'antd'

export const ModelStructureFragment: ModelFragmentProtocol = ({ dataModel }) => {
  return (
    <>
      <ModelFieldTable modelKey={dataModel.modelKey} />
      <Divider />
      <FieldLinkTable modelKey={dataModel.modelKey} />
    </>
  )
}

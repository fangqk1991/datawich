import React from 'react'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'
import { ModelAuthClientTable } from '../model-client/ModelAuthClientTable'

export const ModelAccessFragment: ModelFragmentProtocol = ({ dataModel }) => {
  return (
    <>
      <ModelAuthClientTable modelKey={dataModel.modelKey} />
    </>
  )
}

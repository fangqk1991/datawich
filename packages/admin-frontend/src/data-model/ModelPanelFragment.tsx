import React from 'react'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'
import { ModelPanelsTable } from './ModelPanelsTable'

export const ModelPanelFragment: ModelFragmentProtocol = ({ dataModel, onModelInfoChanged }) => {
  return <ModelPanelsTable dataModel={dataModel} onModelInfoChanged={onModelInfoChanged} />
}

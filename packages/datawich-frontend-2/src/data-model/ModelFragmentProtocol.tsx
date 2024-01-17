import React from 'react'
import { DataModelModel } from '@fangcha/datawich-service'

export interface ModelFragmentProps {
  dataModel: DataModelModel
  onModelInfoChanged: () => void
}

export type ModelFragmentProtocol = React.FC<ModelFragmentProps>

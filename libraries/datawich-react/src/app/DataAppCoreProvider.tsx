import React from 'react'
import { useParams } from 'react-router-dom'
import { DataModelProvider } from '../filter/DataModelContext'
import { ModelPanelProvider } from '../panel/ModelPanelContext'

interface Props extends React.ComponentProps<any> {
  modelKey?: string
}

export const DataAppCoreProvider: React.FC<Props> = (props) => {
  const params = useParams()
  const modelKey = props.modelKey || params.modelKey!
  return (
    <DataModelProvider modelKey={modelKey}>
      <ModelPanelProvider>{props.children}</ModelPanelProvider>
    </DataModelProvider>
  )
}

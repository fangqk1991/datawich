import React from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Divider, Space, Spin } from 'antd'
import { DataModelModel, ModelFieldModel, SdkDatawichApis } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { RouterLink } from '@fangcha/react'
import { useMainFields } from '../hooks/useMainFields'
import { useDataModel } from '../hooks/useDataModel'
import { ModelPanelProvider } from '../filter/ModelPanelContext'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'
import { DataFilterPanel } from '../filter/DataFilterPanel'
import { DataDisplayTable } from '../data-display/DataDisplayTable'

interface Props {
  extrasColumns?: (
    dataModel: DataModelModel,
    mainFields: ModelFieldModel[]
  ) => {
    title: React.ReactNode
    render: (item: any, _: any, index: number) => React.ReactNode
  }[]
}

export const SDK_DataAppDetailView: React.FC<Props> = (props) => {
  const { modelKey = '' } = useParams()

  const dataModel = useDataModel()
  const mainFields = useMainFields()

  if (!dataModel || mainFields.length === 0) {
    return <Spin size='large' />
  }

  return (
    <ModelPanelProvider dataModel={dataModel}>
      <Breadcrumb
        items={[
          {
            title: <RouterLink route={DatawichWebSDKConfig.appListPage}>{'数据应用'}</RouterLink>,
          },
          {
            title: <Space>{dataModel.name}</Space>,
          },
        ]}
      />

      <Divider style={{ margin: '12px 0' }} />

      <DataFilterPanel modelKey={modelKey} mainFields={mainFields} />

      <Divider style={{ margin: '0 0 12px' }} />

      <DataDisplayTable
        mainFields={mainFields}
        loadData={async (params) => {
          const request = MyRequest(new CommonAPI(SdkDatawichApis.DataAppRecordPageDataGet, modelKey))
          request.setQueryParams(params)
          return request.quickSend()
        }}
        extrasColumns={props.extrasColumns ? props.extrasColumns(dataModel, mainFields) : []}
      />
    </ModelPanelProvider>
  )
}

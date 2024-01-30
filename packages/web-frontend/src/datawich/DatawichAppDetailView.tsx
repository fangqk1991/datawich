import React from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Divider, Space, Spin } from 'antd'
import { SdkDatawichApis } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import {
  DataDisplayTable,
  DataFilterPanel,
  ModelPanelProvider,
  useDataModel,
  useMainFields,
} from '@fangcha/datawich-react'
import { RouterLink } from '@fangcha/react'
import { DatawichWebPages } from '@web/datawich-common/web-apis'

export const DatawichAppDetailView: React.FC = () => {
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
            title: <RouterLink route={DatawichWebPages.DatawichAppListRoute}>{'数据应用'}</RouterLink>,
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
        extrasColumns={[]}
      />
    </ModelPanelProvider>
  )
}

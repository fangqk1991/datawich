import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Divider, Space, Spin } from 'antd'
import { DataModelModel, ModelFieldModel, SdkDatawichApis } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { DataDisplayTable } from '@fangcha/datawich-react'
import { RouterLink } from '@fangcha/react'
import { DatawichWebPages } from '@web/datawich-common/web-apis'

export const DatawichAppDetailView: React.FC = () => {
  const { modelKey = '' } = useParams()

  const [dataModel, setDataModel] = useState<DataModelModel>()
  const [mainFields, setMainFields] = useState<ModelFieldModel[]>([])

  useEffect(() => {
    MyRequest(new CommonAPI(SdkDatawichApis.ModelVisibleFieldListGet, modelKey))
      .quickSend()
      .then((response) => {
        setMainFields(response)
      })

    MyRequest(new CommonAPI(SdkDatawichApis.DataModelInfoGet, modelKey))
      .quickSend()
      .then((response) => {
        setDataModel(response)
      })
  }, [modelKey])

  if (!dataModel || mainFields.length === 0) {
    return <Spin size='large' />
  }

  return (
    <div>
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

      <DataDisplayTable
        mainFields={mainFields}
        loadData={async (params) => {
          const request = MyRequest(new CommonAPI(SdkDatawichApis.DataAppRecordPageDataGetV2, modelKey))
          request.setQueryParams(params)
          return request.quickSend()
        }}
        extrasColumns={[]}
      />
    </div>
  )
}

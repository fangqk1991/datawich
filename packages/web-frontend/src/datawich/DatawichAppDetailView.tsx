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

  const dataModel = useDataModel(SdkDatawichApis.DataModelInfoGet)
  const mainFields = useMainFields(SdkDatawichApis.ModelVisibleFieldListGet)

  if (!dataModel || mainFields.length === 0) {
    return <Spin size='large' />
  }

  return (
    <ModelPanelProvider
      dataModel={dataModel}
      apis={{
        getProfileInfo: SdkDatawichApis.ProfileInfoGet,
        getPanelInfo: SdkDatawichApis.ModelPanelGet,
      }}
    >
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

      <DataFilterPanel
        modelKey={modelKey}
        mainFields={mainFields}
        apis={{
          updateProfileInfo: SdkDatawichApis.ProfileUserInfoUpdate,
          createPanel: SdkDatawichApis.ModelPanelCreate,
          updatePanel: SdkDatawichApis.ModelPanelUpdate,
          deletePanel: SdkDatawichApis.ModelPanelDelete,
          getPanelList: SdkDatawichApis.ModelPanelListGet,
        }}
      />

      <Divider style={{ margin: '0 0 12px' }} />

      <DataDisplayTable
        mainFields={mainFields}
        loadData={async (params) => {
          const request = MyRequest(new CommonAPI(SdkDatawichApis.DataAppRecordPageDataGetV2, modelKey))
          request.setQueryParams(params)
          return request.quickSend()
        }}
        extrasColumns={[]}
      />
    </ModelPanelProvider>
  )
}

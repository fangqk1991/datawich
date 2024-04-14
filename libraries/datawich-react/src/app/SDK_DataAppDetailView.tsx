import React, { useReducer } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Divider, Space, Spin } from 'antd'
import { SdkDatawichApis } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { RouterLink } from '@fangcha/react'
import { useMainFields } from '../hooks/useMainFields'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'
import { DataFilterPanel } from '../filter/DataFilterPanel'
import { DataDisplayTable } from '../data-display/DataDisplayTable'
import { DataCreateButton } from '../core/DataCreateButton'
import { useFavorAppsCtx } from '../profile/FavorAppsContext'
import { useDataModelCtx } from '../filter/DataModelContext'
import { DataAppCoreProvider } from './DataAppCoreProvider'

interface Props {
  extrasColumns?: {
    title: React.ReactNode
    render: (item: any, _: any, index: number) => React.ReactNode
  }[]
}

const DataAppCoreView: React.FC<Props> = (props) => {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)

  const dataModel = useDataModelCtx().dataModel
  const modelKey = dataModel.modelKey

  const mainFields = useMainFields(modelKey)
  const favorAppsCtx = useFavorAppsCtx()
  const favored = favorAppsCtx.checkAppFavor(modelKey)

  if (mainFields.length === 0) {
    return <Spin size='large' />
  }

  return (
    <div>
      <Breadcrumb
        items={[
          {
            title: <RouterLink route={DatawichWebSDKConfig.appListPage}>{'数据应用'}</RouterLink>,
          },
          {
            title: (
              <Space>
                {dataModel.name} |
                <a onClick={() => favorAppsCtx.toggleAppFavor(modelKey)}>{favored ? '取消关注' : '关注'}</a>
              </Space>
            ),
          },
        ]}
      />

      <Divider style={{ margin: '12px 0' }} />

      <DataFilterPanel modelKey={modelKey} mainFields={mainFields} />

      <Divider style={{ margin: '0 0 12px' }} />

      <Space style={{ marginBottom: '12px' }}>
        <DataCreateButton modelKey={modelKey} fields={mainFields} onDataChanged={() => forceUpdate()} />
      </Space>

      {/*<Divider style={{ margin: '0 0 12px' }} />*/}

      <DataDisplayTable
        modelKey={modelKey}
        mainFields={mainFields}
        loadData={async (params) => {
          const request = MyRequest(new CommonAPI(SdkDatawichApis.DataAppRecordPageDataGet, modelKey))
          request.setQueryParams(params)
          return request.quickSend()
        }}
        extrasColumns={props.extrasColumns || []}
        onDataChanged={forceUpdate}
      />
    </div>
  )
}

export const SDK_DataAppDetailView: React.FC<Props> = (props) => {
  const { modelKey = '' } = useParams()
  return (
    <DataAppCoreProvider modelKey={modelKey}>
      <DataAppCoreView {...props} />
    </DataAppCoreProvider>
  )
}

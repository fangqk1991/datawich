import React from 'react'
import { LS } from '../core/ReactI18n'
import { Space, Tag } from 'antd'
import { CommonAPI } from '@fangcha/app-request'
import { ModelPanelApis } from '@web/datawich-common/web-api'
import { MyRequest } from '@fangcha/auth-react'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'
import { LoadingView, RouterLink, useLoadingData } from '@fangcha/react'
import { DatawichPages } from '@web/datawich-common/admin-apis'
import { ModelPanelInfo } from '@fangcha/datawich-service'

export const ModelPanelsCard: ModelFragmentProtocol = ({ dataModel }) => {
  const { data: panelList, loading } = useLoadingData(async () => {
    const request = MyRequest(new CommonAPI(ModelPanelApis.ModelPanelListGet, dataModel.modelKey))
    return request.quickSend<ModelPanelInfo[]>()
  }, [dataModel])

  if (loading) {
    return <LoadingView />
  }

  return (
    <div>
      <h4>{LS('[i18n] Model Panels')}</h4>
      <Space>
        {panelList.length === 0 && <span>暂无</span>}
        {panelList.map((item) => (
          <RouterLink
            key={item.panelId}
            route={DatawichPages.DataAppDetailRoute}
            params={[dataModel.modelKey]}
            queryParams={{ panelId: item.panelId }}
          >
            <Tag color={'geekblue'}>{item.name}</Tag>
          </RouterLink>
        ))}
      </Space>
    </div>
  )
}

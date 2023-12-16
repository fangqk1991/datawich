import React, { useEffect, useState } from 'react'
import { LS } from '../core/ReactI18n'
import { ModelPanelInfo } from '@fangcha/datawich-service'
import { Space, Tag } from 'antd'
import { CommonAPI } from '@fangcha/app-request'
import { ModelPanelApis } from '@web/datawich-common/web-api'
import { MyRequest } from '@fangcha/auth-react'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'
import { RouterLink } from '@fangcha/react'
import { DatawichPages } from '@web/datawich-common/admin-apis'

export const ModelPanelsCard: ModelFragmentProtocol = ({ dataModel }) => {
  const [panelList, setPanelList] = useState<ModelPanelInfo[]>([])
  useEffect(() => {
    const request = MyRequest(new CommonAPI(ModelPanelApis.ModelPanelListGet, dataModel.modelKey))
    request.quickSend().then((response) => {
      setPanelList(response)
    })
  }, [dataModel])

  return (
    <div>
      <h3>{LS('[i18n] Model Panels')}</h3>
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

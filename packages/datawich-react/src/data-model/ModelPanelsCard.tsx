import React, { useEffect, useState } from 'react'
import { LS } from '../core/ReactI18n'
import { ModelPanelInfo } from '@fangcha/datawich-service'
import { Space, Tag } from 'antd'
import { CommonAPI } from '@fangcha/app-request'
import { ModelPanelApis } from '@web/datawich-common/web-api'
import { MyRequest } from '@fangcha/auth-react'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'

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
          <Tag
            key={item.panelId}
            color={'geekblue'}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              // const dialog = MilestoneInfoDialog.dialog(item)
              // dialog.show()
            }}
          >
            {item.name}
          </Tag>
        ))}
      </Space>
    </div>
  )
}

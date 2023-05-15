import React, { useEffect, useState } from 'react'
import { LS } from '../core/ReactI18n'
import { ModelMilestoneModel } from '@fangcha/datawich-service'
import { Space, Tag } from 'antd'
import { CommonAPI } from '@fangcha/app-request'
import { ModelMilestoneApis } from '@web/datawich-common/web-api'
import { MyRequest } from '@fangcha/auth-react'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'

export const ModelMilestonePanel: ModelFragmentProtocol = ({ dataModel }) => {
  const [milestoneList, setMilestoneList] = useState<ModelMilestoneModel[]>([])
  useEffect(() => {
    const request = MyRequest(new CommonAPI(ModelMilestoneApis.ModelMilestoneListGet, dataModel.modelKey))
    request.quickSend().then((response) => {
      setMilestoneList(response)
    })
  }, [dataModel])

  return (
    <div>
      <h4>{LS('[i18n] Model Versions')}</h4>
      <Space>
        <Tag color={'error'}>
          master
        </Tag>
        {milestoneList.map((item) => (
          <Tag key={item.uid} color={'geekblue'}>
            {item.tagName}
          </Tag>
        ))}
      </Space>
    </div>
  )
}

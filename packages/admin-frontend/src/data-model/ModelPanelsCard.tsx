import React from 'react'
import { LS } from '../core/ReactI18n'
import { message, Select, Space, Tag } from 'antd'
import { CommonAPI } from '@fangcha/app-request'
import { DataModelApis, DatawichAdminPages, ModelPanelApis } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'
import { LoadingView, RouterLink, useLoadingData } from '@fangcha/react'
import { ModelPanelInfo } from '@fangcha/datawich-service'

export const ModelPanelsCard: ModelFragmentProtocol = ({ dataModel, onModelInfoChanged }) => {
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
            route={DatawichAdminPages.DataAppDetailRoute}
            params={[dataModel.modelKey]}
            queryParams={{ panelId: item.panelId }}
          >
            <Tag color={'geekblue'}>{item.name}</Tag>
          </RouterLink>
        ))}
      </Space>
      <div className={'mt-2'}>
        <Space>
          <b>模型默认面板</b>
          <Select
            style={{ width: '220px' }}
            value={dataModel.extrasData.defaultPanelId || ''}
            onChange={async (panelId) => {
              const request = MyRequest(new CommonAPI(DataModelApis.DataModelUpdate, dataModel.modelKey))
              request.setBodyData({
                extrasData: {
                  defaultPanelId: panelId,
                },
              })
              await request.quickSend()
              message.success('更新成功')
              onModelInfoChanged()
            }}
            options={[
              {
                label: 'None',
                value: '',
              },
              ...panelList.map((item) => ({ label: item.name, value: item.panelId })),
            ]}
          />
        </Space>
      </div>
    </div>
  )
}

import React from 'react'
import { LS } from '../core/ReactI18n'
import { message, Space, Switch, Table, Tag } from 'antd'
import { CommonAPI } from '@fangcha/app-request'
import { DataModelApis, DatawichAdminPages, ModelPanelApis } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'
import { LoadingView, RouterLink, TableViewColumn, useLoadingData } from '@fangcha/react'
import { ModelPanelInfo } from '@fangcha/datawich-service'
import { FT } from '@fangcha/tools'

export const ModelPanelsTable: ModelFragmentProtocol = ({ dataModel, onModelInfoChanged }) => {
  const { data: panelList, loading } = useLoadingData(async () => {
    const request = MyRequest(new CommonAPI(ModelPanelApis.ModelPanelListGet, dataModel.modelKey))
    request.setQueryParams({ showAll: 1 })
    return request.quickSend<ModelPanelInfo[]>()
  }, [dataModel])

  if (loading) {
    return <LoadingView />
  }

  return (
    <div>
      <h4>{LS('[i18n] Model Panels')}</h4>

      <Table
        size={'small'}
        rowKey={(item) => item.panelId}
        columns={TableViewColumn.makeColumns<ModelPanelInfo>([
          {
            title: '#',
            render: (item) => item.panelId,
          },
          {
            title: '面板名',
            render: (item) => (
              <>
                <span>{item.name}</span>{' '}
                {item.panelId === dataModel.extrasData.defaultPanelId && <Tag color={'geekblue'}>系统默认</Tag>}
              </>
            ),
          },
          {
            title: '所有者',
            render: (item) => item.author,
          },
          {
            title: '是否公开',
            render: (item) => (
              <Switch
                checked={!!item.isPublic}
                onChange={async (checked) => {
                  const request = MyRequest(
                    new CommonAPI(ModelPanelApis.ModelPanelUpdate, dataModel.modelKey, item.panelId)
                  )
                  request.setBodyData({
                    isPublic: checked ? 1 : 0,
                  })
                  await request.quickSend()
                  message.success('更新成功')
                  onModelInfoChanged()
                }}
              />
            ),
          },
          {
            title: '创建时间',
            render: (item) => FT(item.createTime),
          },
          {
            title: '操作',
            render: (item) => {
              return (
                <Space>
                  <RouterLink
                    key={item.panelId}
                    route={DatawichAdminPages.DataAppDetailRoute}
                    params={[dataModel.modelKey]}
                    queryParams={{ panelId: item.panelId }}
                  >
                    查看
                  </RouterLink>
                  <a
                    className={'text-danger'}
                    onClick={async () => {
                      const request = MyRequest(new CommonAPI(DataModelApis.DataModelUpdate, dataModel.modelKey))
                      request.setBodyData({
                        extrasData: {
                          defaultPanelId: item.panelId,
                        },
                      })
                      await request.quickSend()
                      message.success('更新成功')
                      onModelInfoChanged()
                    }}
                  >
                    设为默认
                  </a>
                </Space>
              )
            },
          },
        ])}
        dataSource={panelList}
        pagination={false}
      />
    </div>
  )
}

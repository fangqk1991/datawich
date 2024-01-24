import React, { useEffect, useState } from 'react'
import { Button, Descriptions, Divider, message, Space } from 'antd'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'
import { AccessLevel, describeAccessLevelDetail } from '@web/datawich-common/models'
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { CommonAPI } from '@fangcha/app-request'
import { DataModelApis, DatawichAdminPages } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { DataModelModel } from '@fangcha/datawich-service'
import { ModelMilestonePanel } from './ModelMilestonePanel'
import { ConfirmDialog, LoadingDialog, RouterLink } from '@fangcha/react'
import { DataModelDialog } from './DataModelDialog'
import { ModelPanelsCard } from './ModelPanelsCard'
import { useNavigate } from 'react-router-dom'

export const ModelInfoFragment: ModelFragmentProtocol = ({ dataModel, onModelInfoChanged }) => {
  const navigate = useNavigate()
  const [summaryInfo, setSummaryInfo] = useState<{ count: number }>({
    count: 0,
  })
  const [outerModels, setOuterModels] = useState<DataModelModel[]>([])
  useEffect(() => {
    {
      const request = MyRequest(new CommonAPI(DataModelApis.DataModelSummaryInfoGet, dataModel.modelKey))
      request.quickSend().then((response) => setSummaryInfo(response))
    }
    if (dataModel.isLibrary) {
      const request = MyRequest(new CommonAPI(DataModelApis.DataModelOuterModelListGet, dataModel.modelKey))
      request.quickSend().then((response) => {
        setOuterModels(response)
      })
    }
  }, [dataModel])

  return (
    <>
      <Space>
        <Button
          type='primary'
          onClick={() => {
            const dialog = new DataModelDialog({
              title: '编辑模型',
              data: dataModel,
              forEditing: true,
            })
            dialog.show(async (params) => {
              const request = MyRequest(new CommonAPI(DataModelApis.DataModelUpdate, dataModel.modelKey))
              request.setBodyData(params)
              await request.quickSend()
              message.success('更新成功')
              onModelInfoChanged()
            })
          }}
        >
          编辑
        </Button>
        <Button
          danger={true}
          onClick={() => {
            const dialog = new ConfirmDialog({
              content: `确定要清空 "${dataModel.name}" 的所有数据吗？`,
              forceVerify: true,
            })
            dialog.show(async (params) => {
              await LoadingDialog.execute({
                handler: async () => {
                  const request = MyRequest(new CommonAPI(DataModelApis.DataModelRecordsEmpty, dataModel.modelKey))
                  request.setBodyData(params)
                  await request.quickSend()
                  message.success('数据已清空')
                  onModelInfoChanged()
                },
              })
            })
          }}
        >
          清空数据
        </Button>
        <Button
          danger={true}
          onClick={() => {
            const dialog = new ConfirmDialog({
              content: `确定要删除 "${dataModel.name}"？`,
              forceVerify: true,
            })
            dialog.show(async (params) => {
              await LoadingDialog.execute({
                handler: async () => {
                  const request = MyRequest(new CommonAPI(DataModelApis.DataModelDelete, dataModel.modelKey))
                  request.setBodyData(params)
                  await request.quickSend()
                  message.success('模型已删除')
                  navigate(DatawichAdminPages.ModelListRoute)
                },
              })
            })
          }}
        >
          删除模型
        </Button>
      </Space>
      <Divider />
      <Descriptions title='基本信息'>
        <Descriptions.Item label='模型 Key'>{dataModel.modelKey}</Descriptions.Item>
        <Descriptions.Item label='标识符'>{dataModel.shortKey}</Descriptions.Item>
        <Descriptions.Item label='模型名称'>{dataModel.name}</Descriptions.Item>
        <Descriptions.Item label='模型描述'>
          <pre>{dataModel.description}</pre>
        </Descriptions.Item>

        <Descriptions.Item label='是否发布'>
          {dataModel.isOnline ? (
            <span
              style={{
                color: '#67C23A',
              }}
            >
              已发布 <CheckCircleOutlined />
            </span>
          ) : (
            <span
              style={{
                color: '#F56C6C',
              }}
            >
              未发布 <WarningOutlined />
            </span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label='模型可见性'>
          {describeAccessLevelDetail(dataModel.accessLevel as AccessLevel)}
        </Descriptions.Item>
        <Descriptions.Item label='模型关联性'>
          {dataModel.isLibrary ? '本模型的 Unique 字段可被其他模型外键关联' : '本模型不可被其他模型关联'}
        </Descriptions.Item>
        <Descriptions.Item label='维护者'>{dataModel.author}</Descriptions.Item>
        <Descriptions.Item label='概要信息'>
          <Space>
            共 <b>{summaryInfo.count}</b> 条记录
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label='创建时间'>{dataModel.createTime}</Descriptions.Item>
        <Descriptions.Item label='更新时间'>{dataModel.updateTime}</Descriptions.Item>
        <Descriptions.Item label='应用地址'>
          <RouterLink route={DatawichAdminPages.DataAppDetailRoute} params={[dataModel.modelKey]}>
            点击查看
          </RouterLink>
        </Descriptions.Item>
      </Descriptions>
      {outerModels.length > 0 && (
        <div>
          <Divider />
          <h4>以下模型在引用本模型</h4>
          <Space>
            {outerModels.map((model) => (
              <Button
                key={model.modelKey}
                size={'small'}
                onClick={() => {
                  window.open(`/v1/data-model/${model.modelKey}`)
                }}
              >
                {model.name}
              </Button>
            ))}
          </Space>
        </div>
      )}
      <Divider />
      <ModelMilestonePanel dataModel={dataModel} onModelInfoChanged={onModelInfoChanged} />
      <Divider />
      <ModelPanelsCard dataModel={dataModel} onModelInfoChanged={onModelInfoChanged} />
    </>
  )
}

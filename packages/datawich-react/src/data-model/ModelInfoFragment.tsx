import React from 'react'
import { Descriptions } from 'antd'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'
import { AccessLevel, describeAccessLevelDetail } from '@web/datawich-common/models'
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'

export const ModelInfoFragment: ModelFragmentProtocol = ({ dataModel }) => {
  return (
    <>
      {/*<Button*/}
      {/*  type='primary'*/}
      {/*  onClick={() => {*/}
      {/*    const dialog = new AppFormDialog({*/}
      {/*      title: '编辑应用',*/}
      {/*      params: appInfo,*/}
      {/*      forEditing: true,*/}
      {/*    })*/}
      {/*    dialog.show(async (params) => {*/}
      {/*      const request = MyRequest(new CommonAPI(CommonAppApis.AppUpdate, appInfo.appid))*/}
      {/*      request.setBodyData(params)*/}
      {/*      await request.quickSend()*/}
      {/*      message.success('编辑成功')*/}
      {/*      onAppInfoChanged()*/}
      {/*    })*/}
      {/*  }}*/}
      {/*>*/}
      {/*  编辑*/}
      {/*</Button>*/}
      {/*<Divider />*/}
      <Descriptions title='基本信息'>
        <Descriptions.Item label='模型 Key'>{dataModel.modelKey}</Descriptions.Item>
        <Descriptions.Item label='标识符'>{dataModel.shortKey}</Descriptions.Item>
        <Descriptions.Item label='模型名称'>{dataModel.name}</Descriptions.Item>
        <Descriptions.Item label='模型描述'>
          <pre>{dataModel.description}</pre>
        </Descriptions.Item>
        <Descriptions.Item label='是否可导出'>
          {dataModel.isDataExportable ? (
            <span
              style={{
                color: '#67C23A',
              }}
            >
              Yes <CheckCircleOutlined />
            </span>
          ) : (
            <span
              style={{
                color: '#F56C6C',
              }}
            >
              No <WarningOutlined />
            </span>
          )}
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
        <Descriptions.Item label='创建时间'>{dataModel.createTime}</Descriptions.Item>
        <Descriptions.Item label='更新时间'>{dataModel.updateTime}</Descriptions.Item>
        <Descriptions.Item label='应用地址'>
          <a href={`/v1/data-app/${dataModel.modelKey}`}>点击查看</a>
        </Descriptions.Item>
      </Descriptions>
    </>
  )
}

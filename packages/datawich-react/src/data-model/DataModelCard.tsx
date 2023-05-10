import React, { useEffect, useState } from 'react'
import { Space, Tag, Tooltip } from 'antd'
import { DataModelModel } from '@fangcha/datawich-service'
import { CheckCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { AccessLevel, AccessLevelDescriptor, describeAccessLevelDetail } from '@web/datawich-common/models'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DataModelApis } from '@web/datawich-common/web-api'
import { useNavigate } from 'react-router-dom'

interface Props {
  dataApp: DataModelModel
}

export const DataModelCard: React.FC<Props> = ({ dataApp }) => {
  const navigate = useNavigate()

  const [count, setCount] = useState(0)
  useEffect(() => {
    const request = MyRequest(new CommonAPI(DataModelApis.DataModelSummaryInfoGet, dataApp.modelKey))
    request.quickSend<{ count: number }>().then(({ count }) => {
      setCount(count)
    })
  }, [dataApp.modelKey])
  return (
    <div>
      <h4
        style={{
          margin: '8px 0',
          marginBlockStart: '0',
          marginBlockEnd: '0',
        }}
      >
        {dataApp.name}{' '}
        <Tooltip
          title={
            <ul
              style={{
                paddingInlineStart: '12px',
              }}
            >
              <li>modelKey: {dataApp.modelKey}</li>
              <li>维护者: {dataApp.author}</li>
            </ul>
          }
        >
          <InfoCircleOutlined />
        </Tooltip>
      </h4>
      <ul
        style={{
          paddingInlineStart: '12px',
        }}
      >
        <li>
          <Space>
            {dataApp.isOnline && (
              <span
                style={{
                  color: '#67C23A',
                }}
              >
                已发布 <CheckCircleOutlined />
              </span>
            )}
            {!dataApp.isOnline && (
              <span
                style={{
                  color: '#F56C6C',
                }}
              >
                未发布 <WarningOutlined />
              </span>
            )}
            {!!dataApp.isRetained && <Tag color={'error'}>系统保留</Tag>}
            {!!dataApp.isLibrary && <Tag color={'geekblue'}>可关联</Tag>}
            {!!dataApp.tagList &&
              dataApp.tagList.map((item) => (
                <Tag key={item} color={'error'}>
                  {item}
                </Tag>
              ))}
          </Space>
        </li>
        <li>
          {AccessLevelDescriptor.describe(dataApp.accessLevel)}{' '}
          <Tooltip title={describeAccessLevelDetail(dataApp.accessLevel as AccessLevel)}>
            <InfoCircleOutlined />
          </Tooltip>{' '}
          | <b>{count} 条记录</b>
        </li>
        <li>
          <Space>
            <a
              onClick={() => {
                navigate(`/v1/data-model/${dataApp.modelKey}`)
              }}
            >
              管理模型
            </a>
            <a
              onClick={() => {
                navigate(`/v1/data-app/${dataApp.modelKey}`)
              }}
            >
              查看应用
            </a>
          </Space>
        </li>
      </ul>
    </div>
  )
}

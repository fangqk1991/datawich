import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Card, Divider, Space, Spin, Tag, Tooltip } from 'antd'
import { DataAppApis } from '@web/datawich-common/web-api'
import { DataModelModel } from '@fangcha/datawich-service/lib'
import { useNavigate } from 'react-router-dom'
import { LS } from '../core/ReactI18n'
import { CheckCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons'

export const DataModelListView: React.FC = () => {
  const [appList, setAppList] = useState<DataModelModel[]>()
  const navigate = useNavigate()

  useEffect(() => {
    MyRequest(DataAppApis.DataAppListGet)
      .quickSend()
      .then((response) => {
        setAppList(response)
      })
  }, [])

  if (!appList) {
    return <Spin size='large' />
  }

  return (
    <div>
      <Breadcrumb
        items={[
          {
            title: LS('[i18n] Model List'),
          },
        ]}
      />
      <Divider style={{ margin: '12px 0' }} />
      <Card>
        {appList.map((dataApp) => (
          <Card.Grid
            style={{
              cursor: 'pointer',
              padding: '16px',
            }}
            key={dataApp.modelKey}
            onClick={() => {
              navigate(`/v1/data-app/${dataApp.modelKey}`)
            }}
          >
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
            </ul>
          </Card.Grid>
        ))}
      </Card>
    </div>
  )
}

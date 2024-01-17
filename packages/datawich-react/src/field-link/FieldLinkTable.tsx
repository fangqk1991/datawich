import React, { useEffect, useState } from 'react'
import { Button, Divider, message, Space, Switch } from 'antd'
import { FieldLinkModel, ModelFieldModel } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DataModelApis, ModelFieldApis } from '@web/datawich-common/web-api'
import { ConfirmDialog, RouterLink, TableView, TableViewColumn } from '@fangcha/react'
import { DatawichPages } from '@web/datawich-common/admin-apis'
import { TinyList } from '../data-app/TinyList'
import { FieldLinkDialog } from './FieldLinkDialog'

interface Props {
  modelKey: string
}

export const FieldLinkTable: React.FC<Props> = ({ modelKey }) => {
  const [fields, setFields] = useState<ModelFieldModel[]>([])
  const [links, setLinks] = useState<FieldLinkModel[]>([])
  const [version, setVersion] = useState(0)

  useEffect(() => {
    {
      const request = MyRequest(new CommonAPI(ModelFieldApis.DataModelFieldListGet, modelKey))
      request.quickSend().then((response) => {
        setFields(response)
      })
    }
    {
      const request = MyRequest(new CommonAPI(DataModelApis.ModelHoldingLinkListGet, modelKey))
      request.quickSend().then((response) => {
        setLinks(response)
      })
    }
  }, [modelKey, version])

  return (
    <div>
      <h4>关联管理</h4>
      <Space>
        <Button
          type='primary'
          onClick={() => {
            const dialog = new FieldLinkDialog({
              modelKey: modelKey,
              fields: fields,
            })
            dialog.show(async (params) => {
              const request = MyRequest(new CommonAPI(DataModelApis.ModelHoldingLinkCreate, modelKey))
              request.setBodyData(params)
              await request.quickSend()
              message.success('创建成功')
              setVersion(version + 1)
            })
          }}
        >
          创建关联
        </Button>
      </Space>
      <Divider />
      <TableView
        version={version}
        rowKey={(item: FieldLinkModel) => {
          return `${item.linkId}`
        }}
        reactiveQuery={true}
        tableProps={{
          size: 'small',
          bordered: true,
        }}
        columns={TableViewColumn.makeColumns<FieldLinkModel>([
          {
            title: '字段 Key',
            render: (item) => item.fieldKey,
          },
          {
            title: '关联键',
            render: (item) => {
              return (
                <RouterLink route={DatawichPages.ModelDetailRoute} params={[item.refModel]}>
                  {item.refModel}.{item.refField}
                </RouterLink>
              )
            },
          },
          {
            title: '关注内容',
            render: (item) => {
              return (
                <TinyList>
                  {item.referenceFields.map((item) => (
                    <li key={item.fieldKey}>
                      {item.fieldKey} - {item.name}
                    </li>
                  ))}
                </TinyList>
              )
            },
          },
          {
            title: '内联展示',
            render: (item) => (
              <Switch
                checked={!!item.isInline}
                onChange={async (checked) => {
                  const request = MyRequest(new CommonAPI(DataModelApis.ModelHoldingLinkUpdate, modelKey, item.linkId))
                  request.setBodyData({
                    isInline: checked ? 1 : 0,
                  })
                  await request.execute()
                  message.success('更新成功')
                  setVersion(version + 1)
                }}
              />
            ),
          },

          {
            title: '外键约束',
            render: (item) => (
              <Switch
                checked={!!item.isForeignKey}
                onChange={async (checked) => {
                  const request = MyRequest(new CommonAPI(DataModelApis.ModelHoldingLinkUpdate, modelKey, item.linkId))
                  request.setBodyData({
                    isForeignKey: checked ? 1 : 0,
                  })
                  await request.execute()
                  message.success('更新成功')
                  setVersion(version + 1)
                }}
              />
            ),
          },
          {
            title: '操作',
            render: (item) => {
              return (
                <Space>
                  <a
                    type='primary'
                    onClick={() => {
                      const dialog = new FieldLinkDialog({
                        modelKey: modelKey,
                        fields: fields,
                        data: item,
                      })
                      dialog.show(async (params) => {
                        const request = MyRequest(
                          new CommonAPI(DataModelApis.ModelHoldingLinkUpdate, modelKey, item.linkId)
                        )
                        request.setBodyData(params)
                        await request.quickSend()
                        message.success('更新成功')
                        setVersion(version + 1)
                      })
                    }}
                  >
                    编辑
                  </a>
                  <a
                    style={{ color: '#dc3545' }}
                    onClick={async () => {
                      const dialog = new ConfirmDialog({
                        title: '删除关联',
                        content: `确定要删除此关联吗？`,
                      })
                      dialog.show(async () => {
                        const request = MyRequest(
                          new CommonAPI(DataModelApis.ModelHoldingLinkDelete, modelKey, item.linkId)
                        )
                        await request.execute()
                        message.success('删除成功')
                        setVersion(version + 1)
                      })
                    }}
                  >
                    删除
                  </a>
                </Space>
              )
            },
          },
        ])}
        hidePagination={true}
        loadOnePageItems={async () => {
          return links
        }}
      />
    </div>
  )
}

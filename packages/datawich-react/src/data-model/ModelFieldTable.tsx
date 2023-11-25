import React, { useEffect, useMemo, useState } from 'react'
import { JsonEditorDialog, TableView, TableViewColumn } from '@fangcha/react'
import { CommonAPI } from '@fangcha/app-request'
import { ModelFieldApis } from '@web/datawich-common/web-api'
import { FieldTypeDescriptor, ModelFieldModel } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { Button, Divider, message, Space, Switch, Tag } from 'antd'
import { ModelFieldDialog } from './ModelFieldDialog'

interface Props {
  modelKey: string
}

export const ModelFieldTable: React.FC<Props> = ({ modelKey }) => {
  const [fields, setFields] = useState<ModelFieldModel[]>([])
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const request = MyRequest(new CommonAPI(ModelFieldApis.DataModelFieldListGet, modelKey))
    request.quickSend().then((response) => {
      setFields(response)
    })
  }, [modelKey, version])

  const fieldMap = useMemo(() => {
    return fields.reduce((result, cur) => {
      result[cur.fieldKey] = cur
      return result
    }, {})
  }, [fields])

  // this.rebuildIndexMaps()

  return (
    <div>
      <h3>字段管理</h3>
      <Space>
        <Button
          type='primary'
          onClick={() => {
            const dialog = new ModelFieldDialog({
              title: '创建字段',
            })
            dialog.show(async (params) => {
              const request = MyRequest(new CommonAPI(ModelFieldApis.DataModelFieldCreate, modelKey))
              request.setBodyData(params)
              await request.quickSend()
              message.success('创建成功')
              setVersion(version + 1)
            })
          }}
        >
          创建字段
        </Button>
        <Button
          onClick={() => {
            const dialog = new JsonEditorDialog({
              title: '导入字段 JSON',
            })
            dialog.show(async (params) => {
              const request = MyRequest(new CommonAPI(ModelFieldApis.DataModelFieldsBatchImport, modelKey))
              request.setBodyData(params)
              await request.quickSend()
              message.success('创建成功')
              setVersion(version + 1)
            })
          }}
        >
          导入 JSON
        </Button>
      </Space>
      <Divider />
      <TableView
        version={version}
        rowKey={(item: ModelFieldModel) => {
          return `${item.fieldKey}`
        }}
        reactiveQuery={true}
        tableProps={{
          size: 'small',
          bordered: true,
        }}
        columns={TableViewColumn.makeColumns<ModelFieldModel>([
          {
            title: '字段 Key',
            render: (item) => (
              <>
                <span>{item.fieldKey}</span>
                {item.keyAlias && (
                  <>
                    <br />
                    <span>别名: {item.keyAlias}</span>
                  </>
                )}
              </>
            ),
          },
          {
            title: '字段名称',
            render: (item) => <>{item.name}</>,
          },
          {
            title: '字段类型',
            render: (item) => <>{FieldTypeDescriptor.describe(item.fieldType)}</>,
          },
          {
            title: '是否隐藏',
            render: (field) => (
              <Switch
                checked={!!field.isHidden}
                onChange={(checked) => {
                  const request = MyRequest(
                    new CommonAPI(ModelFieldApis.DataModelFieldHiddenUpdate, field.modelKey, field.fieldKey)
                  )
                  request.setBodyData({ isHidden: checked ? 1 : 0 })
                  request.execute().then(() => {
                    message.success('修改成功')
                    setVersion(version + 1)
                  })
                }}
              />
            ),
          },
          {
            title: '是否必填',
            render: (field) =>
              field.isSystem ? (
                <Tag>自动填</Tag>
              ) : (
                <Switch
                  checked={!!field.required}
                  onChange={(checked) => {
                    const request = MyRequest(
                      new CommonAPI(ModelFieldApis.DataModelFieldUpdate, field.modelKey, field.fieldKey)
                    )
                    request.setBodyData({ required: checked ? 1 : 0 })
                    request.execute().then(() => {
                      message.success('修改成功')
                      setVersion(version + 1)
                    })
                  }}
                />
              ),
          },
          {
            title: '操作',
            render: (field) => {
              return (
                <Space>
                  <a
                    type='primary'
                    onClick={() => {
                      const dialog = new ModelFieldDialog({
                        title: '编辑字段',
                        data: field,
                        forEditing: true,
                      })
                      dialog.show(async (params) => {
                        const request = MyRequest(
                          new CommonAPI(ModelFieldApis.DataModelFieldUpdate, modelKey, field.fieldKey)
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
                </Space>
              )
            },
          },
        ])}
        hidePagination={true}
        loadOnePageItems={async () => {
          return fields
        }}
      />
    </div>
  )
}

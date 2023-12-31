import React, { useEffect, useMemo, useState } from 'react'
import { ConfirmDialog, JsonEditorDialog, TableView, TableViewColumn, TextPreviewDialog } from '@fangcha/react'
import { CommonAPI } from '@fangcha/app-request'
import { ModelFieldApis, ModelIndexApis } from '@web/datawich-common/web-api'
import { FieldIndexModel, FieldTypeDescriptor, ModelFieldModel, NumberFormat } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { Button, Divider, message, Space, Switch, Tag } from 'antd'
import { ModelFieldDialog } from './ModelFieldDialog'
import { FieldHelper } from '@web/datawich-common/models'

interface Props {
  modelKey: string
}

export const ModelFieldTable: React.FC<Props> = ({ modelKey }) => {
  const [fields, setFields] = useState<ModelFieldModel[]>([])
  const [indexes, setIndexes] = useState<FieldIndexModel[]>([])
  const [version, setVersion] = useState(0)

  useEffect(() => {
    {
      const request = MyRequest(new CommonAPI(ModelFieldApis.DataModelFieldListGet, modelKey))
      request.quickSend().then((response) => {
        setFields(response)
      })
    }
    {
      const request = MyRequest(new CommonAPI(ModelIndexApis.DataModelColumnIndexListGet, modelKey))
      request.quickSend().then((response) => {
        setIndexes(response)
      })
    }
  }, [modelKey, version])

  const fieldMap = useMemo(() => {
    return fields.reduce((result, cur) => {
      result[cur.fieldKey] = cur
      return result
    }, {} as { [p: string]: ModelFieldModel })
  }, [fields])

  const { indexMap, indexBoolMap, uniqueBoolMap } = useMemo(() => {
    const indexMap = indexes.reduce((result, cur) => {
      result[cur.fieldKey] = cur
      return result
    }, {} as { [p: string]: FieldIndexModel })
    return {
      indexMap: indexMap,
      indexBoolMap: fields.reduce((result, cur) => {
        result[cur.fieldKey] = !!indexMap[cur.fieldKey]
        return result
      }, {} as { [p: string]: boolean }),
      uniqueBoolMap: fields.reduce((result, cur) => {
        result[cur.fieldKey] = !!indexMap[cur.fieldKey] && !!indexMap[cur.fieldKey].isUnique
        return result
      }, {} as { [p: string]: boolean }),
    }
  }, [fields, indexes])

  const createIndex = (field: ModelFieldModel, isUnique: boolean) => {
    const request = MyRequest(new CommonAPI(ModelIndexApis.DataModelColumnIndexCreate, field.modelKey, field.fieldKey))
    request.setBodyData({ isUnique: isUnique ? 1 : 0 })
    request.execute().then(() => {
      message.success('调整索引成功')
      setVersion(version + 1)
    })
  }

  const dropIndex = (field: ModelFieldModel) => {
    const request = MyRequest(new CommonAPI(ModelIndexApis.DataModelColumnIndexDrop, field.modelKey, field.fieldKey))
    request.execute().then(() => {
      message.success('移除索引成功')
      setVersion(version + 1)
    })
  }

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
            title: '是否唯一',
            render: (field) => {
              if (field.fieldKey === 'rid') {
                return <Tag color={'geekblue'}>唯一</Tag>
              }
              if (field.isSystem || !FieldHelper.checkIndexAbleField(field.fieldType)) {
                return <Tag>不可唯一</Tag>
              }
              return (
                <Switch
                  checked={uniqueBoolMap[field.fieldKey]}
                  onChange={(checked) => {
                    if (checked) {
                      createIndex(field, true)
                    } else if (indexBoolMap[field.fieldKey]) {
                      createIndex(field, false)
                    } else {
                      dropIndex(field)
                    }
                  }}
                />
              )
            },
          },
          {
            title: '索引',
            render: (field) => {
              if (!FieldHelper.checkIndexAbleField(field.fieldType)) {
                return <Tag>不可索引</Tag>
              }
              return (
                <Switch
                  checked={indexBoolMap[field.fieldKey]}
                  onChange={(checked) => {
                    if (checked) {
                      createIndex(field, false)
                    } else {
                      dropIndex(field)
                    }
                  }}
                />
              )
            },
          },
          {
            title: '特殊属性',
            render: (field) => {
              return (
                <>
                  {!!field.isSystem && <Tag color={'geekblue'}>系统字段</Tag>}
                  {!!field.searchable && <Tag color={'geekblue'}>可搜索</Tag>}
                  {field.extrasData.numberFormat === NumberFormat.Percent && <Tag color={'warning'}>Percent</Tag>}
                  {!!field.extrasData.readonly && <Tag color={'warning'}>Readonly</Tag>}
                  {!!field.extrasData.matchRegex && <Tag color={'danger'}>{field.extrasData.matchRegex}</Tag>}
                  {!!field.extrasData.visibleLogic && (
                    <Tag color={'danger'} onClick={() => TextPreviewDialog.previewData(field.extrasData.visibleLogic)}>
                      visibleLogic
                    </Tag>
                  )}
                </>
              )
            },
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
                  {!field.isSystem && (
                    <>
                      <a
                        style={{ color: '#28a745' }}
                        onClick={async () => {
                          const dialog = new ModelFieldDialog({
                            title: '创建字段',
                            data: field,
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
                        复制
                      </a>
                      <a
                        style={{ color: '#dc3545' }}
                        onClick={async () => {
                          const dialog = new ConfirmDialog({
                            title: '删除字段',
                            content: `确定要删除 "${field.name}" 吗？`,
                          })
                          dialog.show(async () => {
                            const request = MyRequest(
                              new CommonAPI(ModelFieldApis.DataModelFieldDelete, modelKey, field.fieldKey)
                            )
                            await request.execute()
                            message.success('删除成功')
                            setVersion(version + 1)
                          })
                        }}
                      >
                        删除
                      </a>
                    </>
                  )}
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

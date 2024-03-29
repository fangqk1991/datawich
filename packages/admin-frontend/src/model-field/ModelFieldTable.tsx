import React, { useEffect, useMemo, useState } from 'react'
import {
  ConfirmDialog,
  DraggableOptionsDialog,
  FlexibleFormDialog,
  JsonEditorDialog,
  SimplePickerDialog,
  TableView,
  TableViewColumn,
  TextPreviewDialog,
} from '@fangcha/react'
import { CommonAPI } from '@fangcha/app-request'
import { ModelFieldApis, ModelIndexApis } from '@web/datawich-common/admin-apis'
import { FieldHelper, FieldIndexModel, FieldTypeDescriptor, ModelFieldModel } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { Button, message, Space, Switch, Tag } from 'antd'
import { makeFieldDialog } from './makeFieldDialog'
import { ProFormText } from '@ant-design/pro-components'
import { FieldActionsCell } from './FieldActionsCell'
import { NumberFormat } from '@fangcha/form-models'

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

  const { indexBoolMap, uniqueBoolMap } = useMemo(() => {
    const indexMap = indexes.reduce((result, cur) => {
      result[cur.fieldKey] = cur
      return result
    }, {} as { [p: string]: FieldIndexModel })
    return {
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
      <h4>字段管理</h4>
      <Space>
        <Button
          type='primary'
          onClick={() => {
            const dialog = makeFieldDialog({
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
        <Button
          danger={true}
          onClick={() => {
            const dialog = DraggableOptionsDialog.dialogWithOptions(
              fields.map((field) => ({
                label: field.name,
                value: field.fieldKey,
                entity: field,
              }))
            )
            dialog.show(async (options) => {
              const request = MyRequest(new CommonAPI(ModelFieldApis.DataModelFieldsSort, modelKey))
              request.setBodyData(options.map((item) => item.value))
              await request.quickSend()
              message.success('调整成功')
              setVersion(version + 1)
            })
          }}
        >
          字段排序
        </Button>
      </Space>
      <div className={'my-3'} />
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
                {item.extrasData.keyAlias && (
                  <>
                    <br />
                    <span>别名: {item.extrasData.keyAlias}</span>
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
            render: (item) => (
              <a
                onClick={() => {
                  const dialog = new SimplePickerDialog({
                    title: '修改字段类型',
                    curValue: item.fieldType,
                    options: FieldTypeDescriptor.options(),
                  })
                  dialog.show(async (fieldType) => {
                    const request = MyRequest(
                      new CommonAPI(ModelFieldApis.DataModelFieldTypeUpdate, item.modelKey, item.fieldKey)
                    )
                    request.setBodyData({ fieldType: fieldType })
                    request.execute().then(() => {
                      message.success('修改成功')
                      setVersion(version + 1)
                    })
                  })
                }}
              >
                {FieldTypeDescriptor.describe(item.fieldType)}
              </a>
            ),
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
                <Tag color={'geekblue'}>自动填</Tag>
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
                  {!!field.extrasData.searchable && <Tag color={'geekblue'}>可搜索</Tag>}
                  {field.extrasData.numberFormat === NumberFormat.Percent && <Tag color={'success'}>Percent</Tag>}
                  {field.extrasData.numberFormat === NumberFormat.PurePercent && (
                    <Tag color={'warning'}>PurePercent</Tag>
                  )}
                  {!!field.extrasData.readonly && <Tag color={'warning'}>Readonly</Tag>}
                  {!!field.extrasData.matchRegex && <Tag color={'red'}>{field.extrasData.matchRegex}</Tag>}
                  {!!field.extrasData.bigText && <Tag color={'red'}>超长文本</Tag>}
                  {!!field.extrasData.visibleLogic && (
                    <Tag color={'red'} onClick={() => TextPreviewDialog.previewData(field.extrasData.visibleLogic)}>
                      visibleLogic
                    </Tag>
                  )}
                </>
              )
            },
          },
          {
            title: '动作',
            render: (field) => <FieldActionsCell field={field} onActionsChanged={() => setVersion(version + 1)} />,
          },
          {
            title: '操作',
            render: (field) => {
              return (
                <Space>
                  <a
                    type='primary'
                    onClick={() => {
                      if (field.isSystem) {
                        const dialog = new FlexibleFormDialog({
                          title: '编辑系统字段',
                          formBody: (
                            <>
                              <ProFormText name={'fieldKey'} label={'字段 Key'} disabled={true} />
                              <ProFormText name={'name'} label={'字段名称'} />
                            </>
                          ),
                          placeholder: {
                            fieldKey: field.fieldKey,
                            name: field.name,
                          },
                        })
                        dialog.width = '400px'
                        dialog.show(async (params) => {
                          const request = MyRequest(
                            new CommonAPI(ModelFieldApis.DataSystemModelFieldUpdate, modelKey, field.fieldKey)
                          )
                          request.setBodyData(params)
                          await request.execute()
                          message.success('修改成功')
                          setVersion(version + 1)
                        })
                      } else {
                        const dialog = makeFieldDialog({
                          title: '编辑字段',
                          forEditing: true,
                          field: field,
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
                      }
                    }}
                  >
                    编辑
                  </a>
                  {!field.isSystem && (
                    <>
                      <a
                        style={{ color: '#28a745' }}
                        onClick={async () => {
                          const dialog = makeFieldDialog({
                            title: '创建字段',
                            field: field,
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
                  <a type='primary' onClick={() => TextPreviewDialog.previewData(field)}>
                    Raw
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

import React from 'react'
import { message, Space, Switch, Table, Tag, Tooltip } from 'antd'
import { DBTable, SdkDatabaseApis } from '@fangcha/datawich-service'
import { TableViewColumn, TextPreviewDialog } from '@fangcha/react'
import { CommonAPI } from '@fangcha/app-request'
import { MyRequest } from '@fangcha/auth-react'
import { CommonFormDialog, FormFieldExt } from '@fangcha/form-react'
import { FieldEnumTypeDescriptor, FormBuilder, FormField, FormFieldTypeDescriptor } from '@fangcha/form-models'

interface Props {
  connectionId: string
  table: DBTable
  onDataChanged?: () => void
  hideActions?: boolean
}

export const DBTableFieldsTable: React.FC<Props> = ({ connectionId, table, onDataChanged, hideActions }) => {
  return (
    <Table
      size={'small'}
      scroll={{
        x: 'max-content',
      }}
      rowKey={(item) => item.fieldKey}
      columns={TableViewColumn.makeColumns<FormField>([
        {
          title: '字段 Key',
          render: (item) => (
            <Space>
              {item.fieldKey}
              {item.notVisible && <Tag>隐藏</Tag>}
            </Space>
          ),
        },
        {
          title: '名称',
          render: (item) => item.name,
        },
        {
          title: '字段类型',
          render: (item) => (
            <Space>
              {FormFieldTypeDescriptor.describe(item.fieldType)}
              {item.isPrimary && <Tag color={'success'}>Primary</Tag>}
              {item.isUUID && <Tag color={'success'}>UUID</Tag>}
              {item.isAuthor && <Tag color={'success'}>Author</Tag>}
            </Space>
          ),
        },
        {
          title: '属性',
          render: (item) => (
            <Space>
              {item.isRequired && <Tag color={'success'}>必填</Tag>}
              {item.notInsertable && <Tag color={'error'}>不可插入</Tag>}
              {item.notModifiable && <Tag color={'error'}>不可修改</Tag>}
              {item.enumType && (
                <Tooltip
                  title={
                    <ul
                      style={{
                        paddingInlineStart: '12px',
                      }}
                    >
                      {(item.options || []).map((option) => (
                        <li key={option.value}>
                          {option.value} - {option.label}
                        </li>
                      ))}
                    </ul>
                  }
                >
                  <Tag color={'geekblue'}>{FieldEnumTypeDescriptor.describe(item.enumType)}</Tag>
                </Tooltip>
              )}
            </Space>
          ),
        },
        {
          title: '默认值',
          render: (item) => item.defaultValue,
        },
        {
          title: '备注',
          render: (item) => item.remarks,
        },
        ...(hideActions
          ? []
          : [
              {
                title: '操作',
                render: (item: FormField) => (
                  <Space>
                    <a
                      onClick={() => {
                        const schema = FormBuilder.getFormFieldSchema()
                        {
                          const someField = schema.isRequired as FormFieldExt
                          someField.customFormItem = ({ value, fullKeys, field, updateData }) => {
                            return (
                              <Switch
                                className={'mb-3'}
                                checked={!!value}
                                onChange={async (checked) => {
                                  updateData &&
                                    updateData([
                                      {
                                        field: field,
                                        fullKeys: fullKeys,
                                        value: checked,
                                      },
                                    ])
                                }}
                              />
                            )
                          }
                        }
                        const fields = FormBuilder.buildFields(schema)
                        const dialog = new CommonFormDialog({
                          title: '字段属性',
                          fields: fields,
                          data: item,
                          forEditing: true,
                        })
                        dialog.show(async (params) => {
                          const request = MyRequest(
                            new CommonAPI(SdkDatabaseApis.TableSchemaUpdate, connectionId, table.tableId)
                          )
                          request.setBodyData({
                            fieldsExtras: {
                              ...table.fieldsExtras,
                              [item.fieldKey]: params,
                            },
                          })
                          await request.quickSend()
                          message.success('更新成功')

                          onDataChanged && onDataChanged()
                        })
                      }}
                    >
                      编辑
                    </a>
                    <a onClick={() => TextPreviewDialog.previewData(item)}>Raw</a>
                  </Space>
                ),
              },
            ]),
      ])}
      dataSource={table.fields}
      pagination={false}
    />
  )
}

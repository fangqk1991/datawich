import React from 'react'
import { message, Space, Table, Tag } from 'antd'
import { DBTable, SdkDatabaseApis } from '@fangcha/datawich-service'
import { TableViewColumn } from '@fangcha/react'
import { CommonAPI } from '@fangcha/app-request'
import { MyRequest } from '@fangcha/auth-react'
import { CommonFormDialog } from '@fangcha/form-react'
import { FieldEnumType, FormBuilder, FormField, FormFieldType, FormFieldTypeDescriptor } from '@fangcha/form-models'

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
              {item.extras.isPrimary && <Tag color={'success'}>Primary</Tag>}
              {item.extras.isUUID && <Tag color={'success'}>UUID</Tag>}
              {item.extras.isAuthor && <Tag color={'success'}>Author</Tag>}
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
            </Space>
          ),
        },
        {
          title: '默认值',
          render: (item) => item.defaultValue,
        },
        {
          title: '备注',
          render: (item) => item.extras.remarks,
        },
        ...(hideActions
          ? []
          : [
              {
                title: '操作',
                render: (item: FormField) => (
                  <a
                    onClick={() => {
                      const fields = FormBuilder.buildFields<FormField>({
                        fieldKey: {
                          fieldType: FormFieldType.String,
                          name: '键值',
                          readonly: true,
                        },
                        fieldType: {
                          fieldType: FormFieldType.String,
                          name: '字段类型',
                          extras: {
                            enumType: FieldEnumType.Single,
                            options: FormFieldTypeDescriptor.options(),
                          },
                        },
                        name: {
                          fieldType: FormFieldType.String,
                          name: '名称',
                        },
                        isRequired: {
                          fieldType: FormFieldType.Boolean,
                          name: '必填',
                        },
                        defaultValue: {
                          fieldType: FormFieldType.String,
                          name: '默认值',
                        },
                        extras: {},
                      })
                      const dialog = new CommonFormDialog({
                        title: '字段属性',
                        fields: fields,
                        data: item,
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
                ),
              },
            ]),
      ])}
      dataSource={table.fields}
      pagination={false}
    />
  )
}

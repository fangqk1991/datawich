import React from 'react'
import { message, Space, Table, Tag } from 'antd'
import { DBTable, DBTableField, FieldTypeDescriptor, SdkDatabaseApis } from '@fangcha/datawich-service'
import { TableViewColumn } from '@fangcha/react'
import { CommonAPI } from '@fangcha/app-request'
import { MyRequest } from '@fangcha/auth-react'
import { CommonFormDialog } from '@fangcha/form-react'
import { FormFieldType, FormSchemaHelper } from '@fangcha/form-models'

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
      columns={TableViewColumn.makeColumns<DBTableField>([
        {
          title: '字段 Key',
          render: (item) => (
            <Space>
              {item.fieldKey}
              {item.hidden && <Tag>隐藏</Tag>}
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
              {FieldTypeDescriptor.describe(item.fieldType)}
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
              {item.nullable && <Tag color={'warning'}>可为空</Tag>}
              {!item.insertable && <Tag color={'error'}>不可插入</Tag>}
              {!item.modifiable && <Tag color={'error'}>不可修改</Tag>}
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
                render: (item: DBTableField) => (
                  <a
                    onClick={() => {
                      const fields = FormSchemaHelper.makeFormFields<DBTableField>({
                        fieldKey: FormFieldType.String,
                        fieldType: FormFieldType.String,
                        name: FormFieldType.String,
                        remarks: FormFieldType.String,
                        nullable: FormFieldType.Boolean,
                        insertable: FormFieldType.Boolean,
                        modifiable: FormFieldType.Boolean,
                        defaultValue: FormFieldType.String,
                      })
                      const dialog = new CommonFormDialog({
                        title: '字段属性',
                        fields: FormSchemaHelper.flattenFields(fields),
                        data: item,
                      })
                      dialog.show(async (params) => {
                        message.info(JSON.stringify(params))
                        const request = MyRequest(
                          new CommonAPI(SdkDatabaseApis.TableSchemaUpdate, connectionId, table.tableId)
                        )
                        request.setBodyData({
                          fieldsExtras: {
                            ...table.fieldsExtras,
                            [item.fieldKey]: params,
                          },
                        })
                        // await request.quickSend()
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

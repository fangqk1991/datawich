import React from 'react'
import { message, Space, Table, Tag } from 'antd'
import { DBTable, DBTableField, FieldTypeDescriptor, SdkDatabaseApis } from '@fangcha/datawich-service'
import { JsonEditorDialog, TableViewColumn } from '@fangcha/react'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'

interface Props {
  connectionId: string
  table: DBTable
  onDataChanged?: () => void
  hideActions?: boolean
}

export const TableFieldsTable: React.FC<Props> = ({ connectionId, table, onDataChanged, hideActions }) => {
  return (
    <Table
      size={'small'}
      rowKey={(item) => item.fieldKey}
      columns={TableViewColumn.makeColumns<DBTableField>([
        {
          title: '字段 Key',
          render: (item) => item.fieldKey,
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
                      const dialog = JsonEditorDialog.dialogForEditing({
                        ...item,
                        fieldKey: undefined,
                        isPrimary: undefined,
                      })
                      dialog.show(async (params: Partial<DBTableField>) => {
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

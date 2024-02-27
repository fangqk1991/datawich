import React from 'react'
import { Space, Table, Tag } from 'antd'
import { DBTable, DBTableField, FieldTypeDescriptor } from '@fangcha/datawich-service'
import { TableViewColumn } from '@fangcha/react'

interface Props {
  table: DBTable
}

export const TableFieldsTable: React.FC<Props> = ({ table }) => {
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
          title: '字段类型',
          render: (item) => (
            <Space>
              {FieldTypeDescriptor.describe(item.fieldType)}
              {item.isPrimary && <Tag color={'success'}>Primary</Tag>}
              {item.isUUID && <Tag color={'success'}>UUID</Tag>}
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
      ])}
      dataSource={table.fields}
      pagination={false}
    />
  )
}

import React, { useEffect, useState } from 'react'
import { Divider, Space, Tag } from 'antd'
import { DatabaseApis } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DBTable, DBTableField, FieldTypeDescriptor } from '@fangcha/datawich-service'
import { LoadingView, TableView, TableViewColumn } from '@fangcha/react'
import { useParams } from 'react-router-dom'

export const DBTableDetailView: React.FC = () => {
  const { tableName = '' } = useParams()

  const [tableSchema, setTableSchema] = useState<DBTable>()

  useEffect(() => {
    const request = MyRequest(new CommonAPI(DatabaseApis.TableSchemaGet, tableName))
    request.quickSend().then((response) => setTableSchema(response))
  }, [])

  if (!tableSchema) {
    return <LoadingView />
  }

  return (
    <div>
      <h3>{tableSchema.tableName}</h3>
      <Divider />

      <TableView
        rowKey={(item: DBTableField) => {
          return `${item.fieldKey}`
        }}
        reactiveQuery={true}
        tableProps={{
          size: 'small',
          bordered: true,
        }}
        columns={TableViewColumn.makeColumns<DBTableField>([
          {
            title: '字段 Key',
            render: (item) => item.fieldKey,
          },
          {
            title: '字段名称',
            render: (item) => item.name,
          },
          {
            title: '字段类型',
            render: (item) => FieldTypeDescriptor.describe(item.fieldType),
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
        ])}
        hidePagination={true}
        loadOnePageItems={async () => {
          return tableSchema!.fields
        }}
      />
    </div>
  )
}

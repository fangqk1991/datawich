import React from 'react'
import { DBTable } from '@fangcha/datawich-service'
import { DBTableFieldsTable } from './DBTableFieldsTable'
import { Descriptions } from 'antd'

interface Props {
  connectionId: string
  table: DBTable
}

export const DBTableInfoView: React.FC<Props> = ({ connectionId, table }) => {
  return (
    <div>
      <Descriptions className={'mt-4'}>
        <Descriptions.Item label='表名'>{table.tableId}</Descriptions.Item>
        <Descriptions.Item label='主键'>{table.primaryKey}</Descriptions.Item>
        <Descriptions.Item label='别名'>{table.name}</Descriptions.Item>
        <Descriptions.Item label='仅自己可见'>{table.isPrivate ? '是' : '否'}</Descriptions.Item>
        <Descriptions.Item label='信息'>{table.fields.length} fields</Descriptions.Item>
      </Descriptions>
      <DBTableFieldsTable connectionId={connectionId} table={table} hideActions={true} />
    </div>
  )
}

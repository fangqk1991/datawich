import React, { useEffect, useState } from 'react'
import { DBTable, DBTypicalRecord, transferDBFieldToCore } from '@fangcha/datawich-service'
import { Descriptions } from 'antd'
import { CommonDataCell } from './CommonDataCell'
import { LoadingView } from '@fangcha/react'

interface Props {
  table: DBTable
  loadData: () => Promise<DBTypicalRecord>
  updateData?: (data: {}) => Promise<void>
}

export const DBDataDescriptions: React.FC<Props> = ({ table, loadData, updateData }) => {
  const [version, setVersion] = useState(0)
  const [data, setData] = useState<DBTypicalRecord>()
  useEffect(() => {
    loadData().then((response) => setData(response))
  }, [loadData, version])
  if (!data) {
    return <LoadingView />
  }
  return (
    <Descriptions size={'small'} bordered={true}>
      {table.fields.map((item) => {
        const field = transferDBFieldToCore(item)
        return (
          <Descriptions.Item key={item.fieldKey} label={item.name}>
            <CommonDataCell
              field={field}
              data={data}
              onDataChanged={async (params) => {
                if (updateData) {
                  await updateData(params)
                  setVersion(version + 1)
                }
              }}
            />
          </Descriptions.Item>
        )
      })}
    </Descriptions>
  )
}

import React, { useEffect, useState } from 'react'
import { DBTable, DBTypicalRecord, SdkDBDataApis, transferDBFieldToCore } from '@fangcha/datawich-service'
import { Descriptions, message } from 'antd'
import { CommonDataCell } from './CommonDataCell'
import { LoadingView, ReactPreviewDialog } from '@fangcha/react'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'

interface Props {
  connectionId: string
  table: DBTable
  record: DBTypicalRecord
  onDataChanged?: () => void
}

export const DBDataDescriptions: React.FC<Props> = ({ connectionId, table, record, onDataChanged }) => {
  const [version, setVersion] = useState(0)
  const [data, setData] = useState<DBTypicalRecord>()
  useEffect(() => {
    const request = MyRequest(
      new CommonAPI(SdkDBDataApis.RecordInfoGet, connectionId, table.tableId, record[table.primaryKey])
    )
    request.quickSend<DBTypicalRecord>().then((response) => setData(response))
  }, [record, version])
  if (!data) {
    return <LoadingView />
  }
  return (
    <Descriptions size={'small'} bordered={true}>
      {table.fields
        .filter((field) => !field.hidden)
        .map((item) => {
          const field = transferDBFieldToCore(item)
          return (
            <Descriptions.Item key={item.fieldKey} label={item.name}>
              <CommonDataCell
                field={field}
                data={data}
                updateRecord={async (data, params) => {
                  const request = MyRequest(
                    new CommonAPI(SdkDBDataApis.RecordUpdate, connectionId, table.tableId, data[table.primaryKey])
                  )
                  request.setBodyData(params)
                  await request.execute()
                  message.success('修改成功')
                  setVersion(version + 1)
                  onDataChanged && onDataChanged()
                }}
              />
            </Descriptions.Item>
          )
        })}
    </Descriptions>
  )
}

export const showDBDataDescriptions = (props: Props) => {
  const dialog = new ReactPreviewDialog({
    element: <DBDataDescriptions {...props} />,
  })
  dialog.width = '95%'
  dialog.show()
}

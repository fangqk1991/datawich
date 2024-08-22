import React, { useEffect, useState } from 'react'
import { FieldDisplayItem } from '@fangcha/datawich-service'
import { Descriptions, Divider } from 'antd'
import { LoadingView, ReactPreviewDialog } from '@fangcha/react'
import { MyDataCell } from '../data-display/MyDataCell'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'
import { DataRecord, ExtrasColumn } from './CellModels'

interface Props {
  modelKey: string
  displayItems: FieldDisplayItem[]
  record: DataRecord

  extrasColumns?: ExtrasColumn[]
}

export const RecordDescriptions: React.FC<Props> = ({ modelKey, displayItems, extrasColumns, record }) => {
  const [version, setVersion] = useState(0)
  const [data, setData] = useState<DataRecord>()
  useEffect(() => {
    const request = MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordGet, modelKey, record._data_id))
    request.quickSend<DataRecord>().then((response) => setData(response))
  }, [record, version])
  if (!data) {
    return <LoadingView />
  }
  const columns = extrasColumns || []
  return (
    <>
      <Descriptions title={'展示字段信息'} size={'small'} bordered={true}>
        {displayItems
          .filter((item) => !item.isHidden)
          .map((item) => {
            return (
              <Descriptions.Item key={item.field.dataKey} label={item.field.name}>
                <MyDataCell field={item.field} data={data} />
              </Descriptions.Item>
            )
          })}
        {columns.map((column, index) => (
          <Descriptions.Item key={`custom-${index}-${column.title}`} label={column.title}>
            {column.render(data, data, 0)}
          </Descriptions.Item>
        ))}
      </Descriptions>
      {displayItems.filter((item) => item.isHidden).length > 0 && (
        <>
          <Divider />
          <Descriptions title={'隐藏字段信息'} size={'small'} bordered={true}>
            {displayItems
              .filter((item) => item.isHidden)
              .map((item) => {
                return (
                  <Descriptions.Item key={item.field.dataKey} label={item.field.name}>
                    <MyDataCell field={item.field} data={data} />
                  </Descriptions.Item>
                )
              })}
          </Descriptions>
        </>
      )}
    </>
  )
}

export const showRecordDescriptions = (props: Props) => {
  const dialog = new ReactPreviewDialog({
    element: <RecordDescriptions {...props} />,
  })
  dialog.width = '95%'
  dialog.show()
}

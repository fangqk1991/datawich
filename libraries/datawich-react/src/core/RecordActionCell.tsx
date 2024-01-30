import React from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Dropdown, message } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { FieldHelper, ModelFieldModel } from '@fangcha/datawich-service'
import { CommonAPI } from '@fangcha/app-request'
import { DataRecordDialog } from './DataRecordDialog'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'
import { ConfirmDialog } from '@fangcha/react'

interface Props {
  modelKey: string
  mainFields: ModelFieldModel[]
  record: DataRecord
  onDataChanged?: () => void
}

interface DataRecord {
  rid: number
  _data_id: string
  [p: string]: any
}

export const RecordActionCell: React.FC<Props> = ({ modelKey, mainFields, record, onDataChanged }) => {
  return (
    <Dropdown
      menu={{
        items: [
          {
            key: 'copy',
            label: (
              <a
                style={{ color: '#28a745' }}
                onClick={() => {
                  const request = MyRequest(
                    new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordGet, modelKey, record._data_id)
                  )
                  request.quickSend().then((record) => {
                    const inputData = FieldHelper.cleanDataByModelFields(record, mainFields)
                    const dialog = new DataRecordDialog({
                      mainFields: mainFields,
                      modelKey: modelKey,
                      data: inputData,
                    })
                    dialog.title = '创建数据记录'
                    dialog.show(async (params) => {
                      const request = MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordCreate, modelKey))
                      request.setBodyData(params)
                      await request.execute()
                      message.success('创建成功')
                      onDataChanged && onDataChanged()
                    })
                  })
                }}
              >
                复制
              </a>
            ),
          },
          {
            key: 'edit',
            label: (
              <a
                onClick={() => {
                  const request = MyRequest(
                    new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordGet, modelKey, record._data_id)
                  )
                  request.quickSend().then((record) => {
                    const inputData = FieldHelper.cleanDataByModelFields(record, mainFields)
                    const dialog = new DataRecordDialog({
                      mainFields: mainFields,
                      modelKey: modelKey,
                      data: inputData,
                    })
                    dialog.title = '修改数据记录'
                    dialog.show(async (params) => {
                      const request = MyRequest(
                        new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordUpdate, modelKey, record._data_id)
                      )
                      request.setBodyData(params)
                      await request.execute()
                      message.success('修改成功')
                      onDataChanged && onDataChanged()
                    })
                  })
                }}
              >
                编辑
              </a>
            ),
          },
          {
            key: 'delete',
            label: (
              <a
                style={{ color: '#dc3545' }}
                onClick={async () => {
                  const dialog = new ConfirmDialog({
                    content: '是否删除本记录？',
                  })
                  dialog.show(async () => {
                    const request = MyRequest(
                      new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordDelete, modelKey, record._data_id)
                    )
                    await request.execute()
                    message.success('删除成功')
                    onDataChanged && onDataChanged()
                  })
                }}
              >
                删除
              </a>
            ),
          },
        ],
      }}
      trigger={['click']}
    >
      <a>
        <MenuOutlined />
      </a>
    </Dropdown>
  )
}

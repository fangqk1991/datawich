import React, { useCallback } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Dropdown, message } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import {
  FieldDisplayItem,
  FieldHelper,
  ModelFieldModel,
  transferModelFieldToFormField,
} from '@fangcha/datawich-service'
import { CommonAPI } from '@fangcha/app-request'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'
import { ConfirmDialog } from '@fangcha/react'
import { showRecordDescriptions } from './RecordDescriptions'
import { CommonFormDialog } from '@fangcha/form-react'
import { DataRecord, ExtrasColumn } from './CellModels'

interface Props {
  modelKey: string
  mainFields: ModelFieldModel[]
  displayItems: FieldDisplayItem[]
  record: DataRecord
  onDataChanged?: () => void

  extrasColumns?: ExtrasColumn[]

  actionMenuItems?: React.ReactNode[]
}

export const RecordActionCell: React.FC<Props> = ({
  modelKey,
  mainFields,
  displayItems,
  extrasColumns,
  record,
  onDataChanged,
  actionMenuItems,
}) => {
  actionMenuItems = actionMenuItems || []
  const loadRecordInfo = useCallback(() => {
    const request = MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordGet, modelKey, record._data_id))
    return request.quickSend<DataRecord>()
  }, [])
  return (
    <Dropdown
      menu={{
        items: [
          {
            key: 'favor',
            label: record.isFavored ? (
              <a
                style={{ color: '#dc3545' }}
                onClick={async () => {
                  const request = MyRequest(
                    new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordFavorDelete, modelKey, record._data_id)
                  )
                  await request.execute()
                  message.success('已取消关注')
                  onDataChanged && onDataChanged()
                }}
              >
                取消关注
              </a>
            ) : (
              <a
                style={{ color: '#28a745' }}
                onClick={async () => {
                  const request = MyRequest(
                    new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordFavorAdd, modelKey, record._data_id)
                  )
                  await request.execute()
                  message.success('关注成功')
                  onDataChanged && onDataChanged()
                }}
              >
                关注
              </a>
            ),
          },
          {
            key: 'view',
            label: (
              <a
                style={{ color: '#1677ff' }}
                onClick={() => {
                  showRecordDescriptions({
                    modelKey: modelKey,
                    displayItems: displayItems,
                    record: record,
                    extrasColumns: extrasColumns,
                  })
                }}
              >
                查看
              </a>
            ),
          },
          {
            key: 'copy',
            label: (
              <a
                style={{ color: '#28a745' }}
                onClick={() => {
                  const fields = mainFields.map((field) => transferModelFieldToFormField(field))
                  const dialog = new CommonFormDialog({
                    fields: fields,
                  })
                  dialog.title = '创建数据记录'
                  dialog.loadData = async () => {
                    const record = await loadRecordInfo()
                    dialog.props.data = FieldHelper.cleanDataByFormFields(record, fields)
                  }
                  dialog.show(async (params) => {
                    const request = MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordCreate, modelKey))
                    request.setBodyData(params)
                    await request.execute()
                    message.success('创建成功')
                    onDataChanged && onDataChanged()
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
                style={{ color: '#1677ff' }}
                onClick={() => {
                  const fields = mainFields.map((field) => transferModelFieldToFormField(field))
                  const dialog = new CommonFormDialog({
                    fields: fields,
                  })
                  dialog.title = '修改数据记录'
                  dialog.loadData = async () => {
                    const record = await loadRecordInfo()
                    dialog.props.data = FieldHelper.cleanDataByFormFields(record, fields)
                  }
                  dialog.show(async (params) => {
                    const request = MyRequest(
                      new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordUpdate, modelKey, record._data_id)
                    )
                    request.setBodyData(params)
                    await request.execute()
                    message.success('修改成功')
                    onDataChanged && onDataChanged()
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
          ...actionMenuItems.map((item, index) => ({
            key: `custom_${index}`,
            label: item,
          })),
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

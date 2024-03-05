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

interface Props {
  modelKey: string
  mainFields: ModelFieldModel[]
  displayItems: FieldDisplayItem[]
  record: DataRecord
  onDataChanged?: () => void

  extrasColumns?: {
    title: React.ReactNode
    render: (item: DataRecord, _: DataRecord, index: number) => React.ReactNode
  }[]
}

interface DataRecord {
  rid: number
  _data_id: string
  [p: string]: any
}

interface DescriptionItem {
  key: string
  field: ModelFieldModel
  superField?: ModelFieldModel
  cell: React.ReactNode
}

export const RecordActionCell: React.FC<Props> = ({
  modelKey,
  mainFields,
  displayItems,
  extrasColumns,
  record,
  onDataChanged,
}) => {
  const loadRecordInfo = useCallback(() => {
    const request = MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordGet, modelKey, record._data_id))
    return request.quickSend<DataRecord>()
  }, [])
  return (
    <Dropdown
      menu={{
        items: [
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
                  const dialog = new CommonFormDialog({
                    fields: mainFields.map((field) => transferModelFieldToFormField(field)),
                  })
                  dialog.title = '创建数据记录'
                  dialog.loadData = async () => {
                    const record = await loadRecordInfo()
                    dialog.props.data = FieldHelper.cleanDataByModelFields(record, mainFields)
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
                  const dialog = new CommonFormDialog({
                    fields: mainFields.map((field) => transferModelFieldToFormField(field)),
                  })
                  dialog.title = '修改数据记录'
                  dialog.loadData = async () => {
                    const record = await loadRecordInfo()
                    dialog.props.data = FieldHelper.cleanDataByModelFields(record, mainFields)
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

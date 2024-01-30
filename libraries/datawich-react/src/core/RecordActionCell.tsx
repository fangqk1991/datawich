import React, { useCallback } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Descriptions, Dropdown, message } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { FieldHelper, GeneralDataHelper, ModelFieldModel } from '@fangcha/datawich-service'
import { CommonAPI } from '@fangcha/app-request'
import { DataRecordDialog } from './DataRecordDialog'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'
import { ConfirmDialog, ReactPreviewDialog } from '@fangcha/react'
import { MyDataCell } from '../data-display/MyDataCell'

interface Props {
  modelKey: string
  mainFields: ModelFieldModel[]
  displayFields: ModelFieldModel[]
  record: DataRecord
  onDataChanged?: () => void
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

export const RecordActionCell: React.FC<Props> = ({ modelKey, mainFields, displayFields, record, onDataChanged }) => {
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
                  const dialog = new ReactPreviewDialog({
                    loadElement: async () => {
                      const record = await loadRecordInfo()
                      const items: DescriptionItem[] = []
                      for (const field of displayFields) {
                        const dataKey = GeneralDataHelper.calculateDataKey(field)
                        items.push({
                          key: dataKey,
                          field: field,
                          cell: <MyDataCell field={field} data={record} />,
                        })
                        for (const fieldLink of field.refFieldLinks.filter((item) => item.isInline)) {
                          for (const refField of fieldLink.referenceFields) {
                            const dataKey = GeneralDataHelper.calculateDataKey(refField, field)
                            items.push({
                              key: dataKey,
                              field: refField,
                              superField: field,
                              cell: <MyDataCell field={refField} superField={field} data={record} />,
                            })
                          }
                        }
                      }
                      return (
                        <Descriptions size={'small'} bordered={true}>
                          {items.map((item) => (
                            <Descriptions.Item key={item.key} label={item.field.name}>
                              {item.cell}
                            </Descriptions.Item>
                          ))}
                        </Descriptions>
                      )
                    },
                  })
                  dialog.width = '95%'
                  dialog.show()
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
                  const dialog = new DataRecordDialog({
                    mainFields: mainFields,
                    modelKey: modelKey,
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
                  const dialog = new DataRecordDialog({
                    mainFields: mainFields,
                    modelKey: modelKey,
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

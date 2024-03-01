import React, { useCallback } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Descriptions, Dropdown, message } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { DBTable, DBTypicalRecord, SdkDBDataApis, transferDBFieldToCore } from '@fangcha/datawich-service'
import { CommonAPI } from '@fangcha/app-request'
import { ConfirmDialog, ReactPreviewDialog } from '@fangcha/react'
import { DBTableRecordDialog } from './DBTableRecordDialog'
import { CommonDataCell } from './CommonDataCell'

interface Props {
  connectionId: string
  table: DBTable
  record: DBTypicalRecord
  onDataChanged?: () => void
}

export const DBRecordActionCell: React.FC<Props> = ({ connectionId, table, record, onDataChanged }) => {
  const loadRecordInfo = useCallback(() => {
    const request = MyRequest(
      new CommonAPI(SdkDBDataApis.RecordInfoGet, connectionId, table.tableId, record[table.primaryKey])
    )
    return request.quickSend<DBTypicalRecord>()
  }, [])
  return (
    <Dropdown
      menu={{
        items: [
          {
            key: 'view',
            label: (
              <a
                className={'text-info'}
                onClick={() => {
                  const dialog = new ReactPreviewDialog({
                    loadElement: async () => {
                      const record = await loadRecordInfo()
                      return (
                        <Descriptions size={'small'} bordered={true}>
                          {table.fields.map((item) => {
                            const field = transferDBFieldToCore(item)
                            return (
                              <Descriptions.Item key={item.fieldKey} label={item.name}>
                                <CommonDataCell field={field} data={record} />
                              </Descriptions.Item>
                            )
                          })}
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
                className={'text-success'}
                onClick={() => {
                  const dialog = new DBTableRecordDialog({
                    table: table,
                  })
                  dialog.loadData = async () => {
                    dialog.props.data = await loadRecordInfo()
                  }
                  dialog.title = '创建数据记录'
                  dialog.show(async (params) => {
                    const request = MyRequest(new CommonAPI(SdkDBDataApis.RecordCreate, connectionId, table.tableId))
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
                className={'text-info'}
                onClick={() => {
                  const dialog = new DBTableRecordDialog({
                    table: table,
                  })
                  dialog.loadData = async () => {
                    dialog.props.data = await loadRecordInfo()
                  }
                  dialog.title = '修改数据记录'
                  dialog.show(async (params) => {
                    const request = MyRequest(
                      new CommonAPI(SdkDBDataApis.RecordUpdate, connectionId, table.tableId, record[table.primaryKey])
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
                className={'text-danger'}
                onClick={async () => {
                  const dialog = new ConfirmDialog({
                    content: '是否删除本记录？',
                  })
                  dialog.show(async () => {
                    const request = MyRequest(
                      new CommonAPI(SdkDBDataApis.RecordDelete, connectionId, table.tableId, record[table.primaryKey])
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

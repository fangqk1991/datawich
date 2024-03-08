import React, { useCallback } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Dropdown, message } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { DBTable, DBTypicalRecord, SdkDBDataApis } from '@fangcha/datawich-service'
import { CommonAPI } from '@fangcha/app-request'
import { ConfirmDialog } from '@fangcha/react'
import { showDBDataDescriptions } from './DBDataDescriptions'
import { CommonFormDialog } from '@fangcha/form-react'

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
  const updateRecordInfo = useCallback(async (params: {}) => {
    const request = MyRequest(
      new CommonAPI(SdkDBDataApis.RecordUpdate, connectionId, table.tableId, record[table.primaryKey])
    )
    request.setBodyData(params)
    await request.execute()
    message.success('修改成功')
    onDataChanged && onDataChanged()
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
                  showDBDataDescriptions({
                    connectionId: connectionId,
                    table: table,
                    record: record,
                    onDataChanged: onDataChanged,
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
                className={'text-success'}
                onClick={(e) => {
                  const dialog = new CommonFormDialog({
                    fields: table.fields,
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
                  const dialog = new CommonFormDialog({
                    fields: table.fields,
                  })
                  dialog.loadData = async () => {
                    dialog.props.data = await loadRecordInfo()
                  }
                  dialog.title = '修改数据记录'
                  dialog.show(updateRecordInfo)
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

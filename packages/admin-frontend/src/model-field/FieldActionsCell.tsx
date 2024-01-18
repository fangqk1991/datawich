import React from 'react'
import { ConfirmDialog } from '@fangcha/react'
import { CommonAPI } from '@fangcha/app-request'
import { ModelFieldApis } from '@web/datawich-common/admin-apis'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { message, Tag } from 'antd'
import { ActionEventDescriptor } from '@web/datawich-common/models'
import { FieldActionDialog } from './FieldActionDialog'

interface Props {
  field: ModelFieldModel
  onActionsChanged: () => void
}

export const FieldActionsCell: React.FC<Props> = ({ field, onActionsChanged }) => {
  const actions = field.extrasData.actions || []
  return (
    <>
      {actions.map((action) => (
        <Tag
          key={action.actionId}
          style={{ cursor: 'pointer' }}
          color={'red'}
          closable={true}
          onClick={() => {
            const dialog = new FieldActionDialog({
              data: action,
            })
            dialog.show(async (params) => {
              const request = MyRequest(
                new CommonAPI(ModelFieldApis.DataModelFieldActionsUpdate, field.modelKey, field.fieldKey)
              )
              request.setBodyData(actions.map((item) => (item.actionId === params.actionId ? params : item)))
              await request.execute()
              message.success('更新成功')
              onActionsChanged()
            })
          }}
          onClose={(e) => {
            e.preventDefault()
            const dialog = new ConfirmDialog({
              title: '移除动作',
              content: `确定要移除 "${action.title}" 吗？`,
            })
            dialog.show(async () => {
              const request = MyRequest(
                new CommonAPI(ModelFieldApis.DataModelFieldActionsUpdate, field.modelKey, field.fieldKey)
              )
              request.setBodyData(actions.filter((item) => item !== action))
              await request.execute()
              message.success('移除成功')
              onActionsChanged()
            })
          }}
        >
          {ActionEventDescriptor.describe(action.event)}: {action.title}
        </Tag>
      ))}
      <a
        onClick={() => {
          const dialog = new FieldActionDialog({})
          dialog.show(async (params) => {
            const request = MyRequest(
              new CommonAPI(ModelFieldApis.DataModelFieldActionsUpdate, field.modelKey, field.fieldKey)
            )
            request.setBodyData([...actions, params])
            await request.execute()
            message.success('添加成功')
            onActionsChanged()
          })
        }}
      >
        添加
      </a>
    </>
  )
}

import React from 'react'
import { ModelFieldModel, transferModelFieldToFormField } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { Button, message } from 'antd'
import { CommonFormDialog } from '@fangcha/form-react'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'

interface Props {
  modelKey: string
  fields: ModelFieldModel[]
  onDataChanged?: () => void
}

export const DataCreateButton: React.FC<Props> = ({ modelKey, fields, onDataChanged }) => {
  return (
    <Button
      type={'primary'}
      onClick={() => {
        const dialog = new CommonFormDialog({
          fields: fields.map((field) => transferModelFieldToFormField(field)),
        })
        dialog.title = '新建数据记录'
        dialog.show(async (params) => {
          const request = MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.DataAppRecordCreate, modelKey))
          request.setBodyData(params)
          await request.execute()
          message.success('创建成功')
          onDataChanged && onDataChanged()
        })
      }}
    >
      添加数据
    </Button>
  )
}

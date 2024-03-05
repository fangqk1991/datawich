import React from 'react'
import { ModelFieldModel, transferModelFieldToFormField } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DataAppApis } from '@web/datawich-common/admin-apis'
import { Button, message } from 'antd'
import { CommonFormDialog } from '@fangcha/form-react'

interface Props {
  modelKey: string
  fields: ModelFieldModel[]
  onImportDone?: () => void
}

export const DataCreateButton: React.FC<Props> = ({ modelKey, fields, onImportDone }) => {
  return (
    <Button
      type={'primary'}
      onClick={() => {
        const dialog = new CommonFormDialog({
          fields: fields.map((field) => transferModelFieldToFormField(field)),
        })
        dialog.title = '新建数据记录'
        dialog.show(async (params) => {
          const request = MyRequest(new CommonAPI(DataAppApis.DataAppRecordCreate, modelKey))
          request.setBodyData(params)
          await request.execute()
          message.success('创建成功')
          onImportDone && onImportDone()
        })
      }}
    >
      添加数据
    </Button>
  )
}

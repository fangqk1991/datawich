import React from 'react'
import { ModelClientParams } from '@web/datawich-common/models'
import { FlexibleFormDialog } from '@fangcha/react'
import { ProFormText } from '@ant-design/pro-components'

export const makeClientFormDialog = (params?: ModelClientParams) => {
  return new FlexibleFormDialog({
    title: params ? '编辑客户端' : '创建客户端',
    formBody: (
      <>
        <ProFormText name={'appid'} label={'应用 ID'} disabled={!!params} />
        <ProFormText name={'name'} label={'应用名称'} />
      </>
    ),
    placeholder: {
      appid: '',
      name: '',
    } as ModelClientParams,
  })
}

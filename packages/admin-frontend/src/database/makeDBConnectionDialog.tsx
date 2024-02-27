import React from 'react'
import { FlexibleFormDialog } from '@fangcha/react'
import { ProFormDigit, ProFormText } from '@ant-design/pro-components'
import { DBConnection } from '@fangcha/datawich-service'

export const makeDBConnectionDialog = (params?: DBConnection) => {
  return new FlexibleFormDialog({
    title: params ? '编辑连接信息' : '创建连接',
    formBody: (
      <>
        <ProFormText name={'dbHost'} label={'Host'} placeholder={'127.0.0.1'} />
        <ProFormDigit name={'dbPort'} label={'Port'} placeholder={'3306'} />
        <ProFormText name={'dbName'} label={'DB Name'} required={true} />
        <ProFormText name={'username'} label={'Username'} required={true} />
        <ProFormText.Password name={'password'} label={'Password'} />
      </>
    ),
    placeholder: params,
  })
}

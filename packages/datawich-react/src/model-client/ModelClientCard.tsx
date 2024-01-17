import React from 'react'
import { message, Space } from 'antd'
import { ModelClientModel } from '@web/datawich-common/models'
import { LS } from '../core/ReactI18n'
import { makeClientFormDialog } from './makeClientFormDialog'
import { MyRequest } from '@fangcha/auth-react'
import { DatawichClientApis } from '@web/datawich-common/web-api'
import { CommonAPI } from '@fangcha/app-request'
import { ConfirmDialog } from '@fangcha/react'

interface Props {
  client: ModelClientModel
  onClientChanged: () => void
}

export const ModelClientCard: React.FC<Props> = ({ client, onClientChanged }) => {
  return (
    <div>
      <h5
        style={{
          margin: '8px 0',
          marginBlockStart: '0',
          marginBlockEnd: '0',
        }}
      >
        {client.name} ({client.appid})
      </h5>
      <ul
        style={{
          paddingInlineStart: '12px',
          marginBlockEnd: 0,
        }}
      >
        <li>
          <Space>
            <a
              onClick={() => {
                const dialog = makeClientFormDialog(client)
                dialog.show(async (params) => {
                  const request = MyRequest(new CommonAPI(DatawichClientApis.ModelClientUpdate, client.appid))
                  request.setBodyData(params)
                  await request.quickSend()
                  message.success('更新成功')
                  onClientChanged()
                })
              }}
            >
              {LS('Edit')}
            </a>
            <a onClick={() => {}}>{LS('[i18n] Auth Models')}</a>
            <a
              className={'text-danger'}
              onClick={() => {
                const dialog = new ConfirmDialog({
                  title: '删除应用',
                  content: `确定要删除 "${client.name}" 吗？`,
                })
                dialog.show(async () => {
                  const request = MyRequest(new CommonAPI(DatawichClientApis.ModelClientDelete, client.appid))
                  await request.execute()
                  message.success('移除成功')
                  onClientChanged()
                })
              }}
            >
              {LS('Delete')}
            </a>
          </Space>
        </li>
      </ul>
    </div>
  )
}

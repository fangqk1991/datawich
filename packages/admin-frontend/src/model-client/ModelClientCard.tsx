import React from 'react'
import { message, Space } from 'antd'
import { ClientAuthModel, ClientAuthParams, ModelClientModel } from '@web/datawich-common/models'
import { LS } from '../core/ReactI18n'
import { makeClientFormDialog } from './makeClientFormDialog'
import { MyRequest } from '@fangcha/auth-react'
import { DatawichClientApis } from '@web/datawich-common/admin-apis'
import { CommonAPI } from '@fangcha/app-request'
import { ConfirmDialog, MultiplePickerDialog } from '@fangcha/react'
import { DataModelModel } from '@fangcha/datawich-service'

interface Props {
  client: ModelClientModel
  modelList: DataModelModel[]
  onClientChanged: () => void
}

export const ModelClientCard: React.FC<Props> = ({ client, modelList, onClientChanged }) => {
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
            <a
              onClick={async () => {
                const request = MyRequest(new CommonAPI(DatawichClientApis.ClientAuthModelListGet, client.appid))
                const authItems = (await request.quickSend()) as ClientAuthModel[]
                const authData = authItems.reduce((result, cur) => {
                  result[cur.modelKey] = true
                  return result
                }, {})
                const dialog = new MultiplePickerDialog({
                  checkedList: authItems.map((item) => item.modelKey),
                  options: modelList.map((model) => {
                    return {
                      label: `${model.name}[${model.modelKey}]`,
                      value: model.modelKey,
                    }
                  }),
                })
                dialog.title = LS('[i18n] Auth Models') as string
                dialog.show(async (checkedModelKeys) => {
                  const checkedMap = (checkedModelKeys as string[]).reduce((result, cur) => {
                    result[cur] = true
                    return result
                  }, {})
                  const paramsList: ClientAuthParams[] = []
                  for (const model of modelList) {
                    if (
                      (checkedMap[model.modelKey] && !authData[model.modelKey]) ||
                      (!checkedMap[model.modelKey] && authData[model.modelKey])
                    ) {
                      paramsList.push({
                        appid: client.appid,
                        modelKey: model.modelKey,
                        checked: !!checkedMap[model.modelKey],
                      })
                    }
                  }
                  const request = MyRequest(new CommonAPI(DatawichClientApis.ClientAuthModelListUpdate, client.appid))
                  request.setBodyData(paramsList)
                  await request.execute()
                  message.success('调整成功')
                })
              }}
            >
              {LS('[i18n] Auth Models')}
            </a>
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

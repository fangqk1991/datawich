import React, { useEffect, useMemo, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DatawichClientApis, ModelClientApis } from '@web/datawich-common/web-api'
import { ModelAuthInfo, ModelClientModel } from '@web/datawich-common/models'
import { Checkbox, message, Space } from 'antd'

interface Props {
  modelKey: string
}

export const ModelAuthClientTable: React.FC<Props> = ({ modelKey }) => {
  const [version, setVersion] = useState(0)
  const [clients, setClients] = useState<ModelClientModel[]>([])
  const [authClientList, setAuthClientList] = useState<ModelAuthInfo[]>([])

  useEffect(() => {
    const request = MyRequest(DatawichClientApis.ModelClientListGet)
    request.quickSend<ModelClientModel[]>().then((response) => setClients(response))
  }, [])

  useEffect(() => {
    const request = MyRequest(new CommonAPI(ModelClientApis.ModelAuthClientListGet, modelKey))
    request.quickSend().then((response) => setAuthClientList(response))
  }, [modelKey, version])

  const authClientMapper = useMemo(() => {
    return authClientList.reduce((result, cur) => {
      result[cur.appid] = true
      return result
    }, {})
  }, [authClientList])

  return (
    <div>
      <h4>API Key 管理</h4>
      <Space>
        {clients.map((client) => (
          <Checkbox
            key={client.appid}
            checked={!!authClientMapper[client.appid]}
            onChange={async (e) => {
              const request = MyRequest(new CommonAPI(ModelClientApis.ModelAuthClientListUpdate, modelKey))
              request.setBodyData([
                {
                  modelKey: modelKey,
                  appid: client.appid,
                  checked: e.target.checked,
                },
              ])
              await request.execute()
              message.success('更新成功')
              setVersion(version + 1)
            }}
          >
            {client.name} ({client.appid})
          </Checkbox>
        ))}
      </Space>
    </div>
  )
}

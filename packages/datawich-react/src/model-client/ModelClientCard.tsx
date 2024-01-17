import React from 'react'
import { Space } from 'antd'
import { ModelClientModel } from '@web/datawich-common/models'
import { LS } from '../core/ReactI18n'

interface Props {
  client: ModelClientModel
}

export const ModelClientCard: React.FC<Props> = ({ client }) => {
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
            <a onClick={() => {}}>{LS('Edit')}</a>
            <a onClick={() => {}}>{LS('[i18n] Auth Models')}</a>
            <a className={'text-danger'} onClick={() => {}}>
              {LS('Delete')}
            </a>
          </Space>
        </li>
      </ul>
    </div>
  )
}

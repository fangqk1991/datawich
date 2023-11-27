import React, { useEffect, useState } from 'react'
import { LS } from '../core/ReactI18n'
import { ModelMilestoneModel } from '@fangcha/datawich-service'
import { Button, message, Space, Tag } from 'antd'
import { CommonAPI } from '@fangcha/app-request'
import { ModelMilestoneApis } from '@web/datawich-common/web-api'
import { MyRequest } from '@fangcha/auth-react'
import { ModelFragmentProtocol } from './ModelFragmentProtocol'
import { MilestoneInfoDialog } from './MilestoneInfoDialog'
import * as moment from 'moment/moment'
import { JsonEditorDialog } from '@fangcha/react'

export const ModelMilestonePanel: ModelFragmentProtocol = ({ dataModel }) => {
  const [milestoneList, setMilestoneList] = useState<ModelMilestoneModel[]>([])
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const request = MyRequest(new CommonAPI(ModelMilestoneApis.ModelMilestoneListGet, dataModel.modelKey))
    request.quickSend().then((response) => {
      setMilestoneList(response)
    })
  }, [dataModel, version])

  return (
    <div>
      <h3>{LS('[i18n] Model Versions')}</h3>
      <Space direction={'vertical'}>
        <Space>
          <Button
            onClick={() => {
              const dialog = new JsonEditorDialog({
                title: LS('[i18n] Import')!,
              })
              dialog.show(async (params) => {
                const request = MyRequest(new CommonAPI(ModelMilestoneApis.ModelMilestoneImport, dataModel.modelKey))
                request.setBodyData(params)
                await request.execute()
                message.success('导入成功')
                setVersion(version + 1)
              })
            }}
          >
            {LS('[i18n] Import')}
          </Button>
        </Space>
        <Space>
          <Tag
            color={'error'}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              const dialog = MilestoneInfoDialog.dialog({
                uid: 'master',
                modelKey: dataModel.modelKey,
                tagName: 'master',
                description: '当前模型',
                metadataStr: '',
                createTime: moment().format(),
              } as ModelMilestoneModel)
              dialog.show()
            }}
          >
            master
          </Tag>
          {milestoneList.map((item) => (
            <Tag
              key={item.uid}
              color={'geekblue'}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const dialog = MilestoneInfoDialog.dialog(item)
                dialog.show()
              }}
            >
              {item.tagName}
            </Tag>
          ))}
        </Space>
      </Space>
    </div>
  )
}

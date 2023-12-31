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
import { FlexibleFormDialog, JsonEditorDialog } from '@fangcha/react'
import { ProFormText } from '@ant-design/pro-components'

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
      <h4>{LS('[i18n] Model Versions')}</h4>
      <Space direction={'vertical'}>
        <Space>
          <Button
            type={'primary'}
            onClick={() => {
              const dialog = new FlexibleFormDialog({
                title: '创建版本',
                formBody: (
                  <>
                    <ProFormText name={'tagName'} label={'版本名'} placeholder={'v1.0.0'} />
                    <ProFormText name={'description'} label={'描述'} placeholder={'可以为空'} />
                  </>
                ),
              })
              dialog.show(async (params) => {
                const request = MyRequest(new CommonAPI(ModelMilestoneApis.ModelMilestoneCreate, dataModel.modelKey))
                request.setBodyData(params)
                await request.execute()
                message.success('创建成功')
                setVersion(version + 1)
              })
            }}
          >
            {LS('[i18n] Create')}
          </Button>
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

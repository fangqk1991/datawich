import React, { useEffect, useMemo, useState } from 'react'
import { ConfirmDialog, DialogProps, LoadingDialog, ReactDialog } from '@fangcha/react'
import {
  GeneralDataFormatter,
  ModelFieldModel,
  ModelFullMetadata,
  ModelMilestoneModel,
} from '@fangcha/datawich-service'
import { CommonAPI } from '@fangcha/app-request'
import { ModelFieldApis, ModelMilestoneApis } from '@web/datawich-common/admin-apis'
import { ModelStructurePanel } from './ModelStructurePanel'
import { MyRequest } from '@fangcha/auth-react'
import { sleep } from '@fangcha/tools'
import { Button, Space } from 'antd'

interface Props extends DialogProps {
  milestone: ModelMilestoneModel
}

export class MilestoneInfoDialog extends ReactDialog<Props> {
  title = '管理展示字段'
  hideButtons = true

  public static dialog(milestone: ModelMilestoneModel) {
    const dialog = new MilestoneInfoDialog({
      milestone: milestone,
    })
    dialog.title = `Tag: ${milestone.tagName}`
    return dialog
  }

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const milestone = props.milestone
      const [metadata, setMetadata] = useState<ModelFullMetadata>(null as any)

      const downloadUri = useMemo(() => {
        const commonApi = new CommonAPI(
          ModelMilestoneApis.ModelMilestoneMetadataGet,
          milestone.modelKey,
          milestone.tagName
        )
        return commonApi.api
      }, [milestone])

      useEffect(() => {
        const request = MyRequest(
          new CommonAPI(ModelMilestoneApis.ModelMilestoneMetadataGet, milestone.modelKey, milestone.tagName)
        )
        request.quickSend().then((response) => {
          setMetadata(response)
        })
      }, [milestone])

      return (
        <div>
          <ul>
            <li>标签名: {milestone.tagName}</li>
            <li>描述: {milestone.description}</li>
            <li>
              元信息:{' '}
              <a href={downloadUri} target='_blank'>
                点击下载
              </a>
            </li>
            <li>创建时间: {milestone.createTime}</li>
            {milestone.tagName !== 'master' && (
              <li>
                <span>操作: </span>
                <a
                  style={{ color: '#dc3545' }}
                  onClick={() => {
                    const modelKey = milestone.modelKey
                    const dialog = new ConfirmDialog({
                      title: '还原版本',
                      content: (
                        <div>
                          确定要将 "{milestone.tagName}" 字段结构还原到模型吗？
                          <b className='text-danger'>（模型数据将会丢失）</b>
                        </div>
                      ),
                      forceVerify: true,
                    })
                    dialog.show(async () => {
                      await LoadingDialog.execute({
                        handler: async (context) => {
                          {
                            const request = MyRequest(new CommonAPI(ModelFieldApis.DataModelFieldListGet, modelKey))
                            const items = (await request.quickSend()) as ModelFieldModel[]
                            const fields = items.filter((item) => !item.isSystem)
                            context.setText('成功获取现有模型字段列表')
                            for (let i = 0; i < fields.length; ++i) {
                              const field = fields[i]
                              const request = MyRequest(
                                new CommonAPI(ModelFieldApis.DataModelFieldDelete, modelKey, field.fieldKey)
                              )
                              await request.execute()

                              context.addText(
                                `已删除 ${field.name}(${field.fieldKey})，进度 ${i + 1} / ${fields.length}`
                              )
                            }
                          }
                          {
                            await sleep(100)
                            context.addText(`正在还原 ${metadata.tagName} 字段`)
                            const fields = metadata.modelFields.filter((item) => !item.isSystem)
                            for (let i = 0; i < fields.length; ++i) {
                              const field = GeneralDataFormatter.formatModelField(fields[i])
                              const request = MyRequest(new CommonAPI(ModelFieldApis.DataModelFieldCreate, modelKey))
                              request.setBodyData(field)
                              await request.execute()
                              context.addText(
                                `已创建 ${field.name}(${field.fieldKey})，进度 ${i + 1} / ${fields.length}`
                              )
                            }
                          }

                          await sleep(100)
                          context.addText('版本还原成功，正在刷新页面')

                          context.setText(
                            <Space direction={'vertical'}>
                              <h4>版本还原成功</h4>
                              <Button onClick={() => window.location.reload()}>刷新页面</Button>
                            </Space>,
                            true
                          )
                        },
                        manualDismiss: true,
                      })
                    })
                  }}
                >
                  还原到模型
                </a>
              </li>
            )}
          </ul>
          {metadata && <ModelStructurePanel metadata={metadata} />}
        </div>
      )
    }
  }
}

import React, { useEffect, useMemo, useState } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { ModelFullMetadata, ModelMilestoneModel } from '@fangcha/datawich-service'
import { CommonAPI } from '@fangcha/app-request'
import { ModelMilestoneApis } from '@web/datawich-common/web-api'
import { ModelStructurePanel } from './ModelStructurePanel'
import { MyRequest } from '@fangcha/auth-react'

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
      const [metadata, setMetadata] = useState<ModelFullMetadata | null>(null)

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
                    // const modelKey = this.milestone.modelKey
                    // const dialog = ConfirmDialog.strongDialog()
                    // dialog.title = '还原版本'
                    // dialog.content = `确定要将 "${this.milestone.tagName}" 字段结构还原到模型吗？<b class="text-danger">（模型数据将会丢失）</b>`
                    // dialog.show(async () => {
                    //   const metadata = this.metadata!
                    //
                    //   {
                    //     const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldListGet, modelKey))
                    //     const items = (await request.quickSend()) as ModelFieldModel[]
                    //     const fields = items.filter((item) => !item.isSystem)
                    //     this.$message.success('成功获取现有模型字段列表')
                    //     for (let i = 0; i < fields.length; ++i) {
                    //       const field = fields[i]
                    //       const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldDelete, modelKey, field.fieldKey))
                    //       await request.execute()
                    //       this.$message.success(`已删除 ${field.name}(${field.fieldKey})，进度 ${i + 1} / ${fields.length}`)
                    //     }
                    //   }
                    //   {
                    //     this.$message.success(`正在还原 ${metadata.tagName} 字段`)
                    //     const fields = metadata.modelFields.filter((item) => !item.isSystem)
                    //     for (let i = 0; i < fields.length; ++i) {
                    //       const field = GeneralDataFormatter.formatModelField(fields[i])
                    //       const request = MyAxios(new CommonAPI(ModelFieldApis.DataModelFieldCreate, modelKey))
                    //       request.setBodyData(field)
                    //       await request.execute()
                    //       this.$message.success(`已创建 ${field.name}(${field.fieldKey})，进度 ${i + 1} / ${fields.length}`)
                    //     }
                    //   }
                    //
                    //   AlertTools.showConfirm(`版本还原成功，是否刷新页面`).then(() => {
                    //     window.location.reload()
                    //   })
                    // })
                  }}
                >
                  还原到模型 (TODO)
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

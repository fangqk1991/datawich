import { ResourceTaskModel, ResourceTaskStatus } from '@fangcha/oss-models'
import { DatawichPages } from '@web/datawich-common/admin-apis'
import { message } from 'antd'
import { MessageDialog } from '@fangcha/react'

export class DownloadTaskHelper {
  public static handleDownloadResponse(response: ResourceTaskModel) {
    switch (response.taskStatus) {
      case ResourceTaskStatus.Pending:
      case ResourceTaskStatus.Processing: {
        MessageDialog.alert(
          <>
            任务已提交，生成完毕后可在{' '}
            <a href={DatawichPages.ResourceTaskListRoute} target='_blank'>
              我的下载
            </a>{' '}
            中进行下载
          </>
        )
        break
      }
      case ResourceTaskStatus.Success: {
        window.open(response.downloadUrl)
        break
      }
      case ResourceTaskStatus.Fail: {
        message.error('生成失败，请重新生成')
        break
      }
    }
  }
}

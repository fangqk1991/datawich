import { Divider, message, Progress, Upload, UploadFile } from 'antd'
import React, { useState } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { OSSResourceModel } from '@fangcha/oss-models'
import { FrontendFile } from '@fangcha/tools/lib/file-frontend'
import { OssHTTP } from './OssHTTP'
import { OssFrontendService } from './OssFrontendService'
import axios from 'axios'

interface Props extends DialogProps {
  description?: React.ReactNode
}

export class OssUploadDialog extends ReactDialog<Props, OSSResourceModel> {
  title = '上传文件'
  width = 1000
  // hideButtons = true

  public static uploadFile(callback: (resource: OSSResourceModel) => Promise<void>) {
    const dialog = new OssUploadDialog({})
    dialog.show(callback)
  }

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const [pickedFile, setFile] = useState<UploadFile>()
      const [percent, setPercent] = useState(0)
      props.context.handleResult = async () => {
        if (!pickedFile) {
          message.error('未选择文件')
          throw new Error('未选择文件')
        }
        const file = pickedFile.originFileObj!

        const fileHash = await FrontendFile.computeFileHash(file)
        const fileExt = FrontendFile.computeFileExt(file)
        const mimeType = FrontendFile.computeFileMimeType(file)
        // const metadataDelegate: MetadataBuildProtocol = this.metadataDelegate || OssHTTP.getOssResourceMetadata
        // return await metadataDelegate(params)
        const resourceMetadata = await OssHTTP.getOssResourceMetadata({
          fileHash: fileHash,
          mimeType: mimeType,
          fileExt: fileExt,
          fileSize: file.size,
          bucketName: '' || OssFrontendService.options.defaultBucketName,
          ossZone: '' || OssFrontendService.options.defaultOssZone,
        })

        const formData = new FormData()
        const params = resourceMetadata.ossMetadata.params
        Object.keys(params).forEach((key) => {
          formData.append(key, params[key])
        })
        formData.append('file', file)
        await axios.create().post(resourceMetadata.ossMetadata.url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: any) => {
            const percentage = Math.floor((progressEvent.loaded / progressEvent.total) * 100)
            setPercent(percentage)
          },
        })

        return await OssHTTP.markOssResourceSuccess(resourceMetadata.resourceId)
      }
      return (
        <div>
          <Upload.Dragger
            name='file'
            multiple={false}
            // multiple={true}
            // fileList={file ? [file] : []}
            customRequest={(options) => {
              if (options.onSuccess) {
                options.onSuccess('')
              }
            }}
            showUploadList={false}
            onChange={(info) => {
              const { status } = info.file
              if (status !== 'uploading') {
                // console.info(info.file, info.fileList)
              }
              if (status === 'done') {
                console.info(`${info.file.name} 解析成功`)
                setFile(info.file)
              } else if (status === 'error') {
                console.error(`${info.file.name} 解析失败`)
              }
            }}
          >
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
            <p className='ant-upload-text'>点击选择 或 拖曳文件到此处</p>
          </Upload.Dragger>
          {!!props.description && (
            <>
              <Divider />
              <div>{props.description}</div>
            </>
          )}
          {!!pickedFile && (
            <>
              <Divider />
              <div>
                已选择 {pickedFile.name} - <b>{(pickedFile.size! / 1024 / 1024).toFixed(2)}M</b>
              </div>
            </>
          )}
          <Progress percent={percent} />
        </div>
      )
    }
  }
}

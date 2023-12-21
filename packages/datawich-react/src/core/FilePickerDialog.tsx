import { Divider, message, Upload, UploadFile } from 'antd'
import React, { useState } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { DialogProps, ReactDialog } from '@fangcha/react'

interface Props extends DialogProps {
  description?: React.ReactNode
}

export class FilePickerDialog extends ReactDialog<Props, File> {
  title = '选择文件'
  width = 1000
  // hideButtons = true

  public static pickFile(callback: (file: File) => Promise<void>) {
    const dialog = new FilePickerDialog({})
    dialog.show(callback)
  }

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const [file, setFile] = useState<UploadFile>()
      props.context.handleResult = () => {
        if (!file) {
          message.error('未选择文件')
          throw new Error('未选择文件')
        }
        return file.originFileObj
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
          {!!file && (
            <>
              <Divider />
              <div>
                已选择 {file.name} - <b>{(file.size! / 1024 / 1024).toFixed(2)}M</b>
              </div>
            </>
          )}
        </div>
      )
    }
  }
}

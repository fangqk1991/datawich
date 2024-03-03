import React, { useState } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { Form } from 'antd'
import { ProForm } from '@ant-design/pro-components'
import { CodeEditor } from './CodeEditor'

interface Props extends DialogProps {}

export class CodeEditorDialog extends ReactDialog<Props, string> {
  width = '95%'
  title = '编辑代码'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const [params] = useState({
        code: props.curValue,
      })

      const [form] = Form.useForm()
      props.context.handleResult = () => {
        return form.getFieldValue('code') || ''
      }

      return (
        <ProForm form={form} layout='vertical' style={{ marginTop: '16px' }} submitter={false} initialValues={params}>
          <ProForm.Item
            name={'code'}
            style={{
              margin: 0,
            }}
          >
            <CodeEditor height={Math.max(window.innerHeight - 340, 250)} />
          </ProForm.Item>
        </ProForm>
      )
    }
  }
}

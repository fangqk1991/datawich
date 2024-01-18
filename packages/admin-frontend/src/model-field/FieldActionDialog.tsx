import React, { useState } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { Form, Space, Tooltip } from 'antd'
import { ProForm, ProFormRadio, ProFormText } from '@ant-design/pro-components'
import { FieldActionParams } from '@fangcha/datawich-service'
import { ActionEvent, ActionEventDescriptor } from '@web/datawich-common/models'
import { InfoCircleOutlined } from '@ant-design/icons'
import { makeUUID } from '@fangcha/tools'

interface Props extends DialogProps {
  data?: FieldActionParams
}

export class FieldActionDialog extends ReactDialog<Props, FieldActionParams> {
  width = 800
  title = '动作'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const [params, setParams] = useState<FieldActionParams>(
        JSON.parse(
          JSON.stringify(
            props.data ||
              ({
                actionId: makeUUID(),
                event: ActionEvent.Link,
                title: '',
                content: '',
              } as FieldActionParams)
          )
        )
      )

      const wrapVar = (variable: string) => {
        return `{{.${variable}}}`
      }

      const [form] = Form.useForm()
      props.context.handleResult = () => {
        return {
          ...params,
          ...form.getFieldsValue(),
        }
      }

      return (
        <ProForm form={form} layout='vertical' style={{ marginTop: '16px' }} submitter={false} initialValues={params}>
          <ProFormRadio.Group
            name={'event'}
            label={'动作类型'}
            options={ActionEventDescriptor.options().filter((option) => option.value === ActionEvent.Link)}
            radioType='button'
          />
          <ProFormText name={'title'} label={'描述文字'} />
          <ProFormText
            name={'content'}
            label={
              <Space>
                <span>动作内容</span>
                <Tooltip
                  title={
                    <>
                      {wrapVar('xxx')} 表示变量，请确保数据行存在此字段
                      <br />
                      例：https://abc.abc/cc/{wrapVar('cid')}/
                    </>
                  }
                >
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          />
        </ProForm>
      )
    }
  }
}

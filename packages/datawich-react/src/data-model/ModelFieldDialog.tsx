import React, { useState } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { Form } from 'antd'
import { ProForm, ProFormRadio, ProFormText } from '@ant-design/pro-components'
import { FieldType, FieldTypeDescriptor, ModelFieldParams } from '@fangcha/datawich-service'

interface Props extends DialogProps {
  data?: ModelFieldParams
  forEditing?: boolean
}

export class ModelFieldDialog extends ReactDialog<Props, ModelFieldParams> {
  width = 800
  title = '模型字段'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const [params, setParams] = useState<ModelFieldParams>(
        JSON.parse(
          JSON.stringify(
            props.data ||
              ({
                fieldKey: '',
                name: '',
                required: 0,
                fieldType: FieldType.SingleLineText,
                options: [],
              } as ModelFieldParams)
          )
        )
      )

      const [form] = Form.useForm()
      props.context.handleResult = () => {
        return form.getFieldsValue()
      }

      return (
        <ProForm form={form} layout='vertical' style={{ marginTop: '16px' }} submitter={false} initialValues={params}>
          <ProFormText name={'fieldKey'} label={'字段 Key'} disabled={props.forEditing} />
          <ProFormText name={'name'} label={'字段名称'} />
          <ProFormRadio.Group
            name={'fieldType'}
            label={'字段类型'}
            options={FieldTypeDescriptor.options()}
            radioType='button'
          />
          <ProFormRadio.Group
            name={'required'}
            label={'是否必填'}
            options={[
              {
                label: '是',
                value: 1,
              },
              {
                label: '否',
                value: 0,
              },
            ]}
            radioType='button'
          />
        </ProForm>
      )
    }
  }
}

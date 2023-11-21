import React, { useState } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { Form } from 'antd'
import { ProForm, ProFormRadio, ProFormText, ProFormTextArea } from '@ant-design/pro-components'
import { DataModelParams } from '@fangcha/datawich-service'
import { AccessLevel, AccessLevelDescriptor, ModelType } from '@web/datawich-common/models'

interface Props extends DialogProps {
  data?: DataModelParams
  forEditing?: boolean
}

export class DataModelDialog extends ReactDialog<Props, DataModelParams> {
  width = 800
  title = '数据模型'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const [params, setParams] = useState<DataModelParams>(
        JSON.parse(
          JSON.stringify(
            props.data ||
              ({
                modelKey: '',
                shortKey: '',
                modelType: ModelType.NormalModel,
                accessLevel: AccessLevel.Protected,
                name: '',
                description: '',
                remarks: '',
                isOnline: 1,
                isLibrary: 0,
                star: 0,
              } as DataModelParams)
          )
        )
      )

      const [form] = Form.useForm()
      props.context.handleResult = () => {
        return form.getFieldsValue()
      }

      return (
        <ProForm form={form} layout='vertical' style={{ marginTop: '16px' }} submitter={false} initialValues={params}>
          <ProFormText name={'modelKey'} label={'模型 Key'} disabled={props.forEditing} />
          <ProFormText name={'name'} label={'模型名称'} />
          <ProFormTextArea
            name={'description'}
            label={'模型描述'}
            fieldProps={{
              rows: 3,
            }}
          />
          <ProFormText name={'remarks'} label={'备注'} />
          <ProFormRadio.Group
            name={'isOnline'}
            label={'是否发布'}
            options={[
              {
                label: '已发布',
                value: 1,
              },
              {
                label: '未发布',
                value: 0,
              },
            ]}
            radioType='button'
          />
          <ProFormRadio.Group
            name={'accessLevel'}
            label={'可访问性'}
            options={AccessLevelDescriptor.options()}
            radioType='button'
          />
          <ProFormRadio.Group
            name={'isLibrary'}
            label={'是否可关联'}
            options={[
              {
                label: '可关联',
                value: 1,
              },
              {
                label: '不可关联',
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

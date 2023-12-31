import React, { useState } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { Form } from 'antd'
import { ProForm, ProFormDependency, ProFormDigit, ProFormRadio, ProFormText } from '@ant-design/pro-components'
import {
  FieldType,
  FieldTypeDescriptor,
  ModelFieldModel,
  ModelFieldParams,
  NumberFormat,
  NumberFormatDescriptor,
} from '@fangcha/datawich-service'
import { NumBoolDescriptor } from '@fangcha/tools'
import { TagsFieldExtension } from './TagsFieldExtension'

interface Props extends DialogProps {
  field?: ModelFieldModel
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
            props.field ||
              ({
                fieldKey: '',
                name: '',
                required: 0,
                fieldType: FieldType.SingleLineText,
                options: [],
                extrasData: {
                  numberFormat: NumberFormat.Normal,
                  floatBits: -1,
                },
              } as ModelFieldParams)
          )
        )
      )

      const [form] = Form.useForm()
      props.context.handleResult = () => {
        return {
          ...params,
          ...form.getFieldsValue(),
        }
      }

      return (
        <ProForm form={form} layout='vertical' style={{ marginTop: '16px' }} submitter={false} initialValues={params}>
          <ProFormText name={'fieldKey'} label={'字段 Key'} disabled={props.forEditing} />
          <ProFormRadio.Group
            name={'fieldType'}
            label={'字段类型'}
            options={FieldTypeDescriptor.options()}
            radioType='button'
            disabled={props.forEditing}
          />
          <ProFormText name={'name'} label={'字段名称'} />
          <ProFormRadio.Group
            name={'required'}
            label={'是否必填'}
            options={NumBoolDescriptor.options()}
            radioType='button'
          />
          <ProFormDependency key='fieldType' name={['fieldType']}>
            {({ fieldType }) => {
              if (fieldType === FieldType.Integer || fieldType === FieldType.Float) {
                return (
                  <>
                    <ProFormRadio.Group
                      name={['extrasData', 'numberFormat']}
                      label={'数字格式'}
                      options={NumberFormatDescriptor.options()}
                      radioType='button'
                    />
                    <ProFormDigit name={['extrasData', 'floatBits']} label={'小数精度'} min={Number.MIN_SAFE_INTEGER} />
                  </>
                )
              } else if (fieldType === FieldType.MultiEnum) {
                return (
                  <>
                    <TagsFieldExtension
                      options={params.options}
                      onOptionsChanged={(options) =>
                        setParams({
                          ...params,
                          options: options,
                        })
                      }
                    />
                  </>
                )
              }
            }}
          </ProFormDependency>
        </ProForm>
      )
    }
  }
}

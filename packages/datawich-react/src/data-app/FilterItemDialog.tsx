import React, { useState } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { Form } from 'antd'
import { ProForm, ProFormRadio, ProFormText } from '@ant-design/pro-components'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { FieldFilterParams } from './FieldFilterItem'
import { TextSymbol, TextSymbolDescriptor } from '@fangcha/logic'

interface Props extends DialogProps {
  fieldItems: ModelFieldModel[]
  filterParams?: FieldFilterParams
}

export class FilterItemDialog extends ReactDialog<Props, FieldFilterParams> {
  title = '筛选项'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const fieldItems = props.fieldItems
      const [params, setParams] = useState<FieldFilterParams>(
        JSON.parse(
          JSON.stringify(
            props.filterParams ||
              ({
                key: fieldItems[0].filterKey,
                filterKey: fieldItems[0].filterKey,
                symbol: TextSymbol.$eq,
                value: '',
              } as FieldFilterParams)
          )
        )
      )

      const [form] = Form.useForm()
      props.context.handleResult = () => {
        const options: FieldFilterParams = {
          ...params,
          ...form.getFieldsValue(),
        }
        const result: FieldFilterParams = {
          key: options.symbol === TextSymbol.$eq ? options.filterKey : `${options.filterKey}.${options.symbol}`,
          filterKey: options.filterKey,
          symbol: options.symbol,
          value: options.value,
        }
        return result
      }

      return (
        <ProForm form={form} layout='vertical' style={{ marginTop: '16px' }} submitter={false} initialValues={params}>
          <ProFormRadio.Group
            name={'filterKey'}
            label={'字段'}
            options={fieldItems.map((item) => ({ label: item.name, value: item.filterKey }))}
            radioType='button'
          />
          <ProFormRadio.Group
            name={'symbol'}
            label={'符号'}
            options={TextSymbolDescriptor.options()}
            radioType='button'
          />
          <ProFormText name={'value'} label={'筛选值'} />
        </ProForm>
      )
    }
  }
}

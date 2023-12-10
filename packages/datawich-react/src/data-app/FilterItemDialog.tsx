import React, { useMemo, useState } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { Checkbox, Form } from 'antd'
import {
  ProForm,
  ProFormDateRangePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-components'
import { FieldType, ModelFieldModel } from '@fangcha/datawich-service'
import { FieldFilterParams } from './FieldFilterItem'
import { TextSymbol, TextSymbolDescriptor } from '@fangcha/logic'
import * as dayjs from 'dayjs'

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
      const [curField, setCurField] = useState(() => fieldItems.find((item) => item.filterKey === params.filterKey)!)

      const symbolOptions = useMemo(() => {
        let values: TextSymbol[] = TextSymbolDescriptor.values
        switch (curField.fieldType) {
          case FieldType.Integer:
          case FieldType.Float:
            values = [TextSymbol.$eq, TextSymbol.$ne, TextSymbol.$ge, TextSymbol.$gt, TextSymbol.$le, TextSymbol.$lt]
            break
          case FieldType.SingleLineText:
          case FieldType.MultipleLinesText:
          case FieldType.StringList:
          case FieldType.Link:
          case FieldType.RichText:
          case FieldType.ReadonlyText:
            values = [TextSymbol.$eq, TextSymbol.$like]
            break
          case FieldType.TextEnum:
            values = [TextSymbol.$eq, TextSymbol.$in, TextSymbol.$notIn]
            // values = [TextSymbol.$eq, TextSymbol.$in, TextSymbol.$inStr, TextSymbol.$notIn, TextSymbol.$notInStr]
            break
          case FieldType.MultiEnum:
            values = [
              TextSymbol.$eq,
              TextSymbol.$includeAll,
              TextSymbol.$includeAny,
              TextSymbol.$excludeAll,
              TextSymbol.$excludeAny,
            ]
            break
          case FieldType.Date:
          case FieldType.Datetime:
            values = [
              // TextSymbol.$eq,
              // TextSymbol.$ne,
              // TextSymbol.$ge,
              // TextSymbol.$gt,
              // TextSymbol.$le,
              // TextSymbol.$lt,
              TextSymbol.$between,
            ]
            break
          case FieldType.Attachment:
            break
          case FieldType.User:
            break
          case FieldType.Group:
            break
          case FieldType.Template:
            break
          case FieldType.Dummy:
            break
        }
        return values.map((item) => ({
          label: TextSymbolDescriptor.describe(item),
          value: item,
        }))
      }, [curField])

      const [form] = Form.useForm<FieldFilterParams>()
      props.context.handleResult = () => {
        const options = {
          ...params,
          ...form.getFieldsValue(),
        }
        const result: FieldFilterParams = {
          key: options.symbol === TextSymbol.$eq ? options.filterKey : `${options.filterKey}.${options.symbol}`,
          filterKey: options.filterKey,
          symbol: options.symbol,
          value: options.value,
        }
        if (
          [FieldType.Date, FieldType.Datetime].includes(curField.fieldType) &&
          result.symbol === TextSymbol.$between &&
          Array.isArray(result.value)
        ) {
          result.value = result.value ? result.value.map((item: any) => dayjs(item).format('YYYY-MM-DD')) : []
        }
        return result
      }

      return (
        <ProForm
          form={form}
          layout='vertical'
          style={{ marginTop: '16px' }}
          submitter={false}
          initialValues={params}
          onValuesChange={(options: FieldFilterParams) => {
            if (options.filterKey) {
              setCurField(fieldItems.find((item) => item.filterKey === options.filterKey)!)
            }
          }}
        >
          <ProFormRadio.Group
            name={'filterKey'}
            label={'字段'}
            options={fieldItems.map((item) => ({ label: item.name, value: item.filterKey }))}
            radioType='button'
          />
          <ProFormRadio.Group name={'symbol'} label={'符号'} options={symbolOptions} radioType='button' />

          <ProFormDependency name={['filterKey', 'symbol']}>
            {({ filterKey, symbol }) => {
              return (
                <ProForm.Item name={'value'} label={'筛选值'}>
                  {(() => {
                    switch (curField.fieldType) {
                      case FieldType.Integer:
                      case FieldType.Float:
                        return <ProFormDigit min={Number.MIN_SAFE_INTEGER} />
                      case FieldType.SingleLineText:
                      case FieldType.MultipleLinesText:
                      case FieldType.StringList:
                      case FieldType.Link:
                      case FieldType.RichText:
                      case FieldType.ReadonlyText:
                        break
                      case FieldType.TextEnum:
                        return (
                          <Checkbox.Group
                            style={{
                              display: 'inline-block',
                            }}
                            options={curField.options}
                            // value={checkedValues || []}
                            // onChange={(newValues) => {
                            //   onCheckedValuesChanged && onCheckedValuesChanged(newValues)
                            // }}
                          />
                        )
                      // return <ProFormRadio.Group options={curField.options} radioType='button' />
                      case FieldType.MultiEnum:
                        break
                      case FieldType.Date:
                      case FieldType.Datetime:
                        return (
                          <ProFormDateRangePicker
                            placeholder={['开始时间', '结束时间']}
                            fieldProps={{
                              // value:
                              //   Array.isArray(filterOptions[field.filterKey]) &&
                              //   filterOptions[field.filterKey].length === 2
                              //     ? filterOptions[field.filterKey].map((date: string) => dayjs(date))
                              //     : [null, null],
                              format: (value) => value.format('YYYY-MM-DD'),
                              // onChange: (values) => {
                              //   const dateRange = values ? values.map((item: any) => item.format('YYYY-MM-DD')) : []
                              //   updateQueryParams({
                              //     [field.filterKey]: dateRange,
                              //   })
                              // },
                            }}
                          />
                        )
                      case FieldType.Attachment:
                        break
                      case FieldType.User:
                        break
                      case FieldType.Group:
                        break
                      case FieldType.Template:
                        break
                      case FieldType.Dummy:
                        break
                    }
                    return <ProFormText />
                  })()}
                </ProForm.Item>
              )
            }}
          </ProFormDependency>
        </ProForm>
      )
    }
  }
}

import React, { useMemo, useState } from 'react'
import { DialogProps, ReactDialog } from '@fangcha/react'
import { Checkbox, Form } from 'antd'
import {
  ProForm,
  ProFormCheckbox,
  ProFormDateRangePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-components'
import {
  FieldFilterItem,
  FieldFilterParams,
  FieldType,
  ModelFieldModel,
  ModelPanelTools,
} from '@fangcha/datawich-service'
import { TextSymbol, TextSymbolDescriptor } from '@fangcha/logic'
import * as dayjs from 'dayjs'

interface Props extends DialogProps {
  displayFields: ModelFieldModel[]
  filterItem?: FieldFilterItem
}

export class FilterItemDialog extends ReactDialog<Props, FieldFilterParams> {
  title = '筛选项'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const displayFields = [...props.displayFields]
      if (props.filterItem && !displayFields.find((item) => props.filterItem!.field === item)) {
        displayFields.push(props.filterItem.field)
      }
      const [params, setParams] = useState<FieldFilterParams>(
        JSON.parse(
          JSON.stringify(
            props.filterItem ||
              ({
                key: displayFields[0].filterKey,
                filterKey: displayFields[0].filterKey,
                symbol: TextSymbol.$eq,
                value: '',
              } as FieldFilterParams)
          )
        )
      )
      params.isNot = params.isNot || false

      if (
        [
          TextSymbol.$in,
          TextSymbol.$includeAll,
          TextSymbol.$includeAny,
          TextSymbol.$excludeAll,
          TextSymbol.$excludeAny,
        ].includes(params.symbol) &&
        !Array.isArray(params.value)
      ) {
        params.value = (params.value || '')
          .split(',')
          .map((item) => item.trim())
          .filter((item) => !!item)
      }
      const [curField, setCurField] = useState(() => displayFields.find((item) => item.filterKey === params.filterKey)!)

      const symbolOptions = useMemo(() => {
        let values: TextSymbol[] = [TextSymbol.$eq, TextSymbol.$ne]
        switch (curField.fieldType) {
          case FieldType.Integer:
          case FieldType.Float:
            values = [TextSymbol.$eq, TextSymbol.$ne, TextSymbol.$ge, TextSymbol.$gt, TextSymbol.$le, TextSymbol.$lt]
            break
          case FieldType.SingleLineText:
            values = [
              TextSymbol.$eq,
              TextSymbol.$ne,
              TextSymbol.$like,
              TextSymbol.$startsWith,
              TextSymbol.$endsWith,
              TextSymbol.$isTrue,
              TextSymbol.$in,
            ]
            break
          case FieldType.MultipleLinesText:
          case FieldType.StringList:
          case FieldType.Link:
          case FieldType.RichText:
          case FieldType.ReadonlyText:
            values = [
              TextSymbol.$eq,
              TextSymbol.$ne,
              TextSymbol.$like,
              TextSymbol.$startsWith,
              TextSymbol.$endsWith,
              TextSymbol.$isTrue,
            ]
            break
          case FieldType.TextEnum:
            // values = [TextSymbol.$eq]
            values = [TextSymbol.$eq, TextSymbol.$ne, TextSymbol.$in, TextSymbol.$notIn]
            break
          case FieldType.MultiEnum:
            values = [TextSymbol.$includeAll, TextSymbol.$includeAny, TextSymbol.$excludeAll, TextSymbol.$excludeAny]
            break
          case FieldType.Date:
          case FieldType.Datetime:
            values = [TextSymbol.$between]
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
        const options: FieldFilterParams = {
          ...params,
          ...form.getFieldsValue(),
        }
        const result: FieldFilterParams = {
          key: ModelPanelTools.calculateFilterItemKey(options),
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
        } else if ([TextSymbol.$isTrue, TextSymbol.$isNull, TextSymbol.$isNotNull].includes(result.symbol)) {
          result.value = '1'
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
              setCurField(displayFields.find((item) => item.filterKey === options.filterKey)!)
            }
          }}
        >
          <ProFormCheckbox name={'isNot'}>
            <b style={{ color: 'red' }}>结果取反</b>
          </ProFormCheckbox>
          <ProFormRadio.Group
            name={'filterKey'}
            label={'字段'}
            options={displayFields.map((item) => ({ label: item.name, value: item.filterKey }))}
            radioType='button'
          />
          <ProFormRadio.Group
            name={'symbol'}
            label={'符号'}
            options={symbolOptions}
            radioType='button'
            fieldProps={{
              onChange: () => {
                setParams({
                  ...params,
                })
              },
            }}
          />

          <ProFormDependency name={['filterKey', 'symbol']}>
            {({ filterKey, symbol }) => {
              if ([TextSymbol.$isTrue, TextSymbol.$isNull, TextSymbol.$isNotNull].includes(symbol)) {
                return <></>
              }
              return (
                <ProForm.Item name={'value'} label={'筛选值'}>
                  {(() => {
                    switch (symbol as TextSymbol) {
                      case TextSymbol.$eq:
                      case TextSymbol.$ne:
                        if ([FieldType.Integer, FieldType.Float].includes(curField.fieldType)) {
                          return <ProFormDigit min={Number.MIN_SAFE_INTEGER} />
                        } else if (curField.fieldType === FieldType.TextEnum) {
                          return <ProFormRadio.Group options={curField.options} radioType='button' />
                        }
                        break
                      case TextSymbol.$ge:
                      case TextSymbol.$gt:
                      case TextSymbol.$le:
                      case TextSymbol.$lt:
                        return <ProFormDigit min={Number.MIN_SAFE_INTEGER} />
                      case TextSymbol.$includeAll:
                      case TextSymbol.$includeAny:
                      case TextSymbol.$excludeAll:
                      case TextSymbol.$excludeAny:
                      case TextSymbol.$in:
                      case TextSymbol.$notIn:
                        if (curField.fieldType === FieldType.SingleLineText) {
                          return <ProFormText />
                        }
                        return (
                          <Checkbox.Group
                            style={{
                              display: 'inline-block',
                            }}
                            options={curField.options}
                          />
                        )
                      case TextSymbol.$between:
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
                      case TextSymbol.$like:
                      case TextSymbol.$startsWith:
                      case TextSymbol.$endsWith:
                        break
                      case TextSymbol.$boolEQ:
                        break
                      case TextSymbol.$isTrue:
                      case TextSymbol.$isNull:
                      case TextSymbol.$isNotNull:
                        return '无'
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

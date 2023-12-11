import React, { useEffect, useMemo, useState } from 'react'
import { FilterItemDialog } from './FilterItemDialog'
import { DeleteOutlined, EditOutlined, PlusSquareOutlined } from '@ant-design/icons'
import { TextSymbol, TextSymbolDescriptor } from '@fangcha/logic'
import { TinyList } from './TinyList'
import { FieldType, ModelFieldModel } from '@fangcha/datawich-service'
import { useQueryParams } from '@fangcha/react'
import { FieldFilterItem } from './FieldFilterItem'
import { Space } from 'antd'
import { ProForm, ProFormDateRangePicker } from '@ant-design/pro-components'
import * as dayjs from 'dayjs'

interface Props {
  fields: ModelFieldModel[]
}

export const DataFilterPanel: React.FC<Props> = ({ fields }) => {
  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams<{ keywords: string; [p: string]: any }>()

  const fieldMapper = useMemo(() => {
    return fields.reduce((result, cur) => {
      result[cur.filterKey] = cur
      return result
    }, {} as { [p: string]: ModelFieldModel })
  }, [fields])

  const [keywords, setKeywords] = useState('')
  useEffect(() => {
    setKeywords(queryParams.keywords || '')
  }, [queryParams.keywords])

  const filterItems = useMemo(() => {
    const items: FieldFilterItem[] = []
    for (const key of Object.keys(queryParams)) {
      if (!queryParams[key]) {
        continue
      }
      if (fieldMapper[key]) {
        items.push({
          key: key,
          filterKey: key,
          symbol: TextSymbol.$eq,
          field: fieldMapper[key],
          value: queryParams[key],
        })
        continue
      }
      const matches = key.match(/^([a-zA-Z_][\w.]+)\.(\$\w+)(\.\w+)?$/)
      if (!matches || !fieldMapper[matches[1]]) {
        continue
      }
      const filterKey = matches[1]
      const symbol = matches[2] as TextSymbol
      items.push({
        key: key,
        filterKey: filterKey,
        symbol: symbol,
        field: fieldMapper[filterKey],
        value: queryParams[key],
      })
    }
    return items
  }, [queryParams, fieldMapper])

  return (
    <Space direction={'vertical'}>
      <h4 style={{ margin: '6px 0', fontSize: '110%' }}>
        筛选条件{' '}
        <a
          onClick={() => {
            const dialog = new FilterItemDialog({
              fieldItems: fields,
            })
            dialog.show((params) => {
              updateQueryParams({
                [params.key]: params.value,
              })
            })
          }}
        >
          <PlusSquareOutlined />
        </a>
      </h4>
      <TinyList>
        {keywords && (
          <li>
            keywords = {keywords}{' '}
            <a
              style={{ color: 'red' }}
              onClick={() => {
                updateQueryParams({
                  keywords: undefined,
                })
              }}
            >
              <DeleteOutlined />
            </a>
          </li>
        )}
        {filterItems.map((item) => {
          const symbolText = (() => {
            // if (
            //   (item.field.fieldType === FieldType.Date || item.field.fieldType === FieldType.Datetime) &&
            //   Array.isArray(item.value)
            // ) {
            //   return TextSymbol.$between
            // }
            return TextSymbolDescriptor.describe(item.symbol)
          })()
          return (
            <li key={item.key}>
              <span>{item.field.name}</span> <b style={{ color: '#dc3545' }}>{symbolText}</b>{' '}
              <span>{typeof item.value === 'object' ? JSON.stringify(item.value) : item.value}</span>{' '}
              <a
                onClick={() => {
                  const dialog = new FilterItemDialog({
                    filterParams: item,
                    fieldItems: fields,
                  })
                  dialog.show((params) => {
                    updateQueryParams({
                      [item.key]: undefined,
                      [params.key]: params.value,
                    })
                  })
                  updateQueryParams({
                    keywords: undefined,
                  })
                }}
              >
                <EditOutlined />
              </a>{' '}
              <a
                style={{ color: 'red' }}
                onClick={() => {
                  updateQueryParams({
                    [item.key]: undefined,
                  })
                }}
              >
                <DeleteOutlined />
              </a>
            </li>
          )
        })}
      </TinyList>
      {/*<ProForm autoFocusFirstInput={false} submitter={false} layout={'horizontal'}>*/}
      {/*  {fields*/}
      {/*    .filter((field) => [FieldType.Date, FieldType.Datetime].includes(field.fieldType as FieldType))*/}
      {/*    .map((field) => {*/}
      {/*      const key = `${field.filterKey}.${TextSymbol.$between}`*/}
      {/*      return (*/}
      {/*        <ProFormDateRangePicker*/}
      {/*          key={key}*/}
      {/*          name={key}*/}
      {/*          label={field.name}*/}
      {/*          placeholder={['开始时间', '结束时间']}*/}
      {/*          fieldProps={{*/}
      {/*            value:*/}
      {/*              Array.isArray(queryParams[key]) && queryParams[key].length === 2*/}
      {/*                ? queryParams[key].map((date: string) => dayjs(date))*/}
      {/*                : [null, null],*/}
      {/*            format: (value) => value.format('YYYY-MM-DD'),*/}
      {/*            onChange: (values) => {*/}
      {/*              const dateRange = values ? values.map((item: any) => item.format('YYYY-MM-DD')) : []*/}
      {/*              updateQueryParams({*/}
      {/*                [key]: dateRange,*/}
      {/*              })*/}
      {/*            },*/}
      {/*          }}*/}
      {/*        />*/}
      {/*      )*/}
      {/*    })}*/}
      {/*</ProForm>*/}
    </Space>
  )
}

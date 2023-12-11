import React, { useEffect, useMemo, useState } from 'react'
import { FilterItemDialog } from './FilterItemDialog'
import { DeleteOutlined, PlusSquareOutlined } from '@ant-design/icons'
import { TextSymbol } from '@fangcha/logic'
import { TinyList } from './TinyList'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { useQueryParams } from '@fangcha/react'
import { FieldFilterItem } from './FieldFilterItem'
import { Button, Input, Space } from 'antd'
import { DataFilterItemView } from './DataFilterItemView'

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
      <Space wrap={true}>
        <Input.Search
          value={keywords}
          onChange={({ target: { value } }) => setKeywords(value)}
          placeholder='Keywords'
          onSearch={(keywords: string) => {
            updateQueryParams({
              keywords: keywords,
            })
          }}
          allowClear
          enterButton
        />
        <Button
          onClick={() => {
            setQueryParams({})
            setKeywords('')
          }}
        >
          重置过滤器
        </Button>
      </Space>
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
        {filterItems.map((item) => (
          <DataFilterItemView
            key={item.key}
            filterItem={item}
            fields={fields}
            onFilterItemChanged={(options) => updateQueryParams(options)}
          />
        ))}
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

import React from 'react'
import { CoreField, FieldType } from '@fangcha/datawich-service'
import { ColumnType } from 'antd/es/table/interface'
import { Select } from 'antd'
import { CommonDataCell } from './CommonDataCell'
import { SelectOption } from '@fangcha/tools'

interface Props {
  field: CoreField
  filterOptions?: {}
  onFilterChange?: (params: {}) => void
  fixedColumn?: boolean

  render?: (item: any) => React.ReactNode
  getOptionsForEnumField?: () => SelectOption[]
  onDataChanged?: (data: {}, params: {}) => Promise<void>
}

export const commonDataColumn = (props: Props): ColumnType<any> => {
  const field = props.field
  const filterOptions = props.filterOptions || {}
  const filterKey = field.filterKey || field.fieldKey
  const filtered = !!Object.keys(filterOptions).find(
    (key) => key.startsWith(filterKey) && !key.endsWith('.disabled') && !!filterOptions[key]
  )

  let header = <>{field.name}</>
  let filterView: any = undefined
  switch (field.fieldType) {
    case FieldType.TextEnum:
      header = (
        <Select
          value={filterOptions[filterKey] || ''}
          style={{ width: '100%' }}
          onChange={(value) => {
            if (props.onFilterChange) {
              props.onFilterChange({ [filterKey]: value })
            }
          }}
          size={'small'}
          options={[
            {
              label: field.name,
              value: '',
            },
            ...(props.getOptionsForEnumField ? props.getOptionsForEnumField() : field.options || []),
          ]}
        />
      )
      break
  }

  return {
    className:
      filterOptions && (filtered || (filterOptions['sortKey'] === filterKey && !!filterOptions['sortDirection']))
        ? 'bg-highlight'
        : '',
    title: <div>{header}</div>,
    render:
      props.render ||
      ((item: any) => (
        <CommonDataCell
          field={field}
          data={item}
          onDataItemChanged={
            props.onDataChanged
              ? async (params) => {
                  await props.onDataChanged!(item, params)
                }
              : undefined
          }
        />
      )),
    key: filterKey,
    fixed: props.fixedColumn ? 'left' : undefined,
    sortOrder: filterOptions['sortKey'] === filterKey ? filterOptions['sortDirection'] : undefined,
    sorter: (() => {
      switch (field.fieldType) {
        case FieldType.Integer:
        case FieldType.Float:
        case FieldType.SingleLineText:
        case FieldType.Date:
        case FieldType.Datetime:
          return true
      }
      // switch (field.fieldType) {
      //   case FieldType.Integer:
      //   case FieldType.Float:
      //     return (a, b) => a[dataKey] - b[dataKey]
      //   case FieldType.SingleLineText:
      //     return (a, b) => (a[dataKey] || '').localeCompare(b[dataKey])
      //   case FieldType.Date:
      //   case FieldType.Datetime:
      //     return (a, b) => moment(a[dataKey]).valueOf() - moment(b[dataKey]).valueOf()
      // }
      return undefined
    })(),
    filtered: filtered,
    filterDropdown: filterView ? <div style={{ padding: '8px' }}>{filterView}</div> : undefined,
  }
}

import React from 'react'
import { ColumnType } from 'antd/es/table/interface'
import { Select } from 'antd'
import { CommonDataCell } from './CommonDataCell'
import { SelectOption } from '@fangcha/tools'
import { FieldEnumType, FieldStringType, FormField, FormFieldType } from '@fangcha/form-models'

interface Props {
  field: FormField
  filterOptions?: {}
  onFilterChange?: (params: {}) => void
  fixedColumn?: boolean

  render?: (item: any) => React.ReactNode
  getOptionsForEnumField?: () => SelectOption[]
  updateRecord?: (data: {}, params: {}) => Promise<void> | void
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
  if (field.extras.enumType === FieldEnumType.Single) {
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
          ...(props.getOptionsForEnumField ? props.getOptionsForEnumField() : field.extras.options || []),
        ]}
      />
    )
  }

  return {
    className:
      filterOptions && (filtered || (filterOptions['sortKey'] === filterKey && !!filterOptions['sortDirection']))
        ? 'bg-highlight'
        : '',
    title: <div>{header}</div>,
    render:
      props.render || ((item: any) => <CommonDataCell field={field} data={item} updateRecord={props.updateRecord} />),
    key: filterKey,
    fixed: props.fixedColumn ? 'left' : undefined,
    sortOrder: filterOptions['sortKey'] === filterKey ? filterOptions['sortDirection'] : undefined,
    sorter: (() => {
      switch (field.fieldType) {
        case FormFieldType.Number:
        case FormFieldType.Boolean:
        case FormFieldType.Date:
        case FormFieldType.Datetime:
          return true
        case FormFieldType.String:
          return (
            (!field.extras.stringType || field.extras.stringType === FieldStringType.Normal) &&
            !field.extras.multipleLines
          )
      }
      return undefined
    })(),
    filtered: filtered,
    filterDropdown: filterView ? <div style={{ padding: '8px' }}>{filterView}</div> : undefined,
  }
}

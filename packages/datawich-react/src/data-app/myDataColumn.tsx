import React from 'react'
import { FieldType, GeneralDataHelper, ModelFieldModel } from '@fangcha/datawich-service'
import { MyDataCell } from './MyDataCell'
import { ColumnType } from 'antd/es/table/interface'
import { Button, Checkbox, Popover, Select } from 'antd'
import * as moment from 'moment'

interface Props {
  field: ModelFieldModel
  superField?: ModelFieldModel
  filterOptions?: {}
  onFilterChange?: (params: {}) => void
  tagsCheckedMap?: any
}

export const myDataColumn = (props: Props): ColumnType<any> => {
  const field = props.field
  const superField = props.superField
  const filterOptions = props.filterOptions || {}
  const filterKey = field.filterKey

  const getOptionsForEnumField = (data?: any) => {
    let options = field.options || []
    if (field.constraintKey) {
      const constraintKey = data
        ? GeneralDataHelper.calculateDataKey({
            fieldKey: field.constraintKey,
            modelKey: field.modelKey,
          })
        : GeneralDataHelper.calculateFilterKey({
            fieldKey: field.constraintKey,
            modelKey: field.modelKey,
          })
      const constraintValue = data ? data[constraintKey] : filterOptions[constraintKey]
      if (constraintValue) {
        options = options.filter((option) => {
          const restraintValueMap = option['restraintValueMap'] || {}
          return !!restraintValueMap[constraintValue]
        })
      }
    }
    return options
  }

  let header = <>{field.name}</>
  switch (field.fieldType) {
    case FieldType.Enum:
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
            ...getOptionsForEnumField(),
          ]}
        />
      )
      break
    case FieldType.MultiEnum:
      const tagsCheckedMap = props.tagsCheckedMap || {}
      const checkedList = GeneralDataHelper.getCheckedTagsForField(field, tagsCheckedMap)
      header = (
        <Popover
          content={
            <Checkbox.Group
              options={field.options}
              value={checkedList}
              onChange={(checkedValue) => {
                if (props.onFilterChange) {
                  props.onFilterChange({
                    [filterKey]: checkedValue.join(','),
                  })
                }
              }}
            />
          }
          trigger='click'
        >
          <Button type={'link'}>{filterOptions[filterKey] ? checkedList.join(', ') : field.name}</Button>
        </Popover>
      )
      break
  }
  const dataKey = GeneralDataHelper.calculateDataKey(field, superField)

  return {
    className: props.filterOptions && props.filterOptions[filterKey] ? 'bg-highlight' : '',
    title: <div>{header}</div>,
    render: (item: any) => <MyDataCell field={field} superField={superField} data={item} />,
    key: filterKey,
    fixed: field.extrasData.fixedColumn ? 'left' : undefined,
    sortOrder: filterOptions['sortKey'] === filterKey ? filterOptions['sortDirection'] : undefined,
    sorter: (() => {
      switch (field.fieldType) {
        case FieldType.Integer:
        case FieldType.Float:
          return (a, b) => a[dataKey] - b[dataKey]
        case FieldType.SingleLineText:
          return (a, b) => (a[dataKey] || '').localeCompare(b[dataKey])
        case FieldType.Date:
        case FieldType.Datetime:
          return (a, b) => moment(a[dataKey]).valueOf() - moment(b[dataKey]).valueOf()
      }
      return undefined
    })(),
  }
}

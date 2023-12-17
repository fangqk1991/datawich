import React from 'react'
import { FilterItemDialog } from './FilterItemDialog'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { TextSymbolDescriptor } from '@fangcha/logic'
import { FieldFilterItem, FieldType, ModelFieldModel } from '@fangcha/datawich-service'

interface Props {
  filterItem: FieldFilterItem
  fields: ModelFieldModel[]
  onFilterItemChanged: (options: {}) => void
}

export const DataFilterItemView: React.FC<Props> = ({ filterItem, fields, onFilterItemChanged }) => {
  const describeValue = (val: string | string[]): any => {
    if (Array.isArray(val)) {
      return val.map((subVal) => describeValue(subVal))
    }
    switch (filterItem.field.fieldType) {
      case FieldType.TextEnum:
      case FieldType.MultiEnum:
        return filterItem.field.value2LabelMap[val]
    }
    return val
  }
  const displayValue = describeValue(filterItem.value)
  return (
    <li>
      <span>{filterItem.field.name}</span>{' '}
      <b style={{ color: '#dc3545' }}>{TextSymbolDescriptor.describe(filterItem.symbol)}</b>{' '}
      <span>{Array.isArray(displayValue) ? JSON.stringify(displayValue) : displayValue}</span>{' '}
      <a
        onClick={() => {
          const dialog = new FilterItemDialog({
            filterItem: filterItem,
            displayFields: fields,
          })
          dialog.show((params) => {
            onFilterItemChanged({
              [filterItem.key]: undefined,
              [params.key]: params.value,
            })
          })
          onFilterItemChanged({
            keywords: undefined,
          })
        }}
      >
        <EditOutlined />
      </a>{' '}
      <a
        style={{ color: 'red' }}
        onClick={() => {
          onFilterItemChanged({
            [filterItem.key]: '',
          })
        }}
      >
        <DeleteOutlined />
      </a>
    </li>
  )
}

import React from 'react'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { TextSymbol, TextSymbolDescriptor } from '@fangcha/logic'
import { FieldDisplayItem, FieldFilterItem, FieldType, ModelPanelTools, } from '@fangcha/datawich-service'
import { Checkbox, Tag } from 'antd'
import { FilterItemDialog } from './FilterItemDialog'

interface Props {
  filterItem: FieldFilterItem
  displayItems: FieldDisplayItem[]
  onFilterItemChanged: (options: {}) => void
}

export const DataFilterItemView: React.FC<Props> = ({ filterItem, displayItems, onFilterItemChanged }) => {
  const describeValue = (val: string | string[]): any => {
    if ([TextSymbol.$isTrue, TextSymbol.$isNull, TextSymbol.$isNotNull].includes(filterItem.symbol)) {
      return ''
    }
    if (Array.isArray(val)) {
      return val.map((subVal) => describeValue(subVal))
    }
    switch (filterItem.field.fieldType) {
      case FieldType.TextEnum:
      case FieldType.MultiEnum:
        if (val.includes(',')) {
          return describeValue(
            val
              .split(',')
              .map((item) => item.trim())
              .filter((item) => !!item)
          )
        }
        return filterItem.field.value2LabelMap[val]
    }
    return val
  }
  const displayValue = describeValue(filterItem.value)

  const element = (
    <>
      <span>{filterItem.field.name}</span>{' '}
      <b style={{ color: '#dc3545' }}>{TextSymbolDescriptor.describe(filterItem.symbol)}</b>{' '}
      <span>{Array.isArray(displayValue) ? JSON.stringify(displayValue) : displayValue}</span>
    </>
  )
  const checked = !filterItem.disabled
  return (
    <li>
      <Tag color={checked ? 'green' : ''}>
        {filterItem.isNot ? (
          <>
            <b style={{ color: '#dc3545' }}>NOT</b> ({element})
          </>
        ) : (
          element
        )}{' '}
        <Checkbox
          checked={checked}
          onChange={(e) => {
            if (e.target.checked) {
              onFilterItemChanged({
                [ModelPanelTools.calculateFilterItemKey({
                  ...filterItem,
                  disabled: true,
                })]: '',
                [ModelPanelTools.calculateFilterItemKey({
                  ...filterItem,
                  disabled: false,
                })]: filterItem.value,
              })
            } else {
              onFilterItemChanged({
                [ModelPanelTools.calculateFilterItemKey({
                  ...filterItem,
                  disabled: false,
                })]: '',
                [ModelPanelTools.calculateFilterItemKey({
                  ...filterItem,
                  disabled: true,
                })]: filterItem.value,
              })
            }
          }}
        />{' '}
        <a
          onClick={() => {
            const dialog = new FilterItemDialog({
              filterItem: filterItem,
              displayItems: displayItems,
            })
            dialog.show((params) => {
              onFilterItemChanged({
                [filterItem.key]: '',
                [params.key]: params.value,
              })
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
      </Tag>
    </li>
  )
}

import React from 'react'
import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { TextSymbol, TextSymbolDescriptor } from '@fangcha/logic'
import { FieldDisplayItem, FieldFilterItem, FieldType, ModelPanelTools } from '@fangcha/datawich-service'
import { Checkbox, Tag } from 'antd'
import { FilterItemDialog } from './FilterItemDialog'

interface Props {
  filterItem: FieldFilterItem
  displayItems: FieldDisplayItem[]
  onFilterItemChanged: (paramsList: { key: string; value: string | string[] }[]) => void
}

export const DataFilterItemView: React.FC<Props> = ({ filterItem, displayItems, onFilterItemChanged }) => {
  const describeValue = (val: string | string[]): any => {
    if ([TextSymbol.$isTrue, TextSymbol.$isNull, TextSymbol.$isNotNull].includes(filterItem.symbol)) {
      return ''
    }
    if (Array.isArray(val)) {
      return val.map((subVal) => describeValue(subVal))
    }
    if (val.startsWith('::')) {
      const filterKey = val.replace('::', '')
      const displayItem = displayItems.find((item) => item.field.filterKey === filterKey)
      if (displayItem) {
        return displayItem.field.name
      }
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
              onFilterItemChanged([
                {
                  key: filterItem.key,
                  value: '',
                },
                {
                  key: ModelPanelTools.calculateFilterItemKey({
                    ...filterItem,
                    disabled: false,
                  }),
                  value: filterItem.value,
                },
              ])
            } else {
              onFilterItemChanged([
                {
                  key: filterItem.key,
                  value: '',
                },
                {
                  key: ModelPanelTools.calculateFilterItemKey({
                    ...filterItem,
                    disabled: true,
                  }),
                  value: filterItem.value,
                },
              ])
            }
          }}
        />{' '}
        <a
          onClick={() => {
            const dialog = new FilterItemDialog({
              title: '添加筛选项',
              filterItem: filterItem,
              displayItems: displayItems,
            })
            dialog.show((params) => {
              onFilterItemChanged([params])
            })
          }}
        >
          <CopyOutlined />
        </a>{' '}
        <a
          onClick={() => {
            const dialog = new FilterItemDialog({
              title: '编辑筛选项',
              filterItem: filterItem,
              displayItems: displayItems,
            })
            dialog.show((params) => {
              onFilterItemChanged([
                {
                  key: filterItem.key,
                  value: '',
                },
                params,
              ])
            })
          }}
        >
          <EditOutlined />
        </a>{' '}
        <a
          style={{ color: 'red' }}
          onClick={() => {
            onFilterItemChanged([
              {
                key: filterItem.key,
                value: '',
              },
            ])
          }}
        >
          <DeleteOutlined />
        </a>
      </Tag>
    </li>
  )
}

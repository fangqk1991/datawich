import React from 'react'
import { FieldType, GeneralDataHelper, ModelFieldModel } from '@fangcha/datawich-service'
import { MyDataCell } from './MyDataCell'
import { ColumnType } from 'antd/es/table/interface'
import { Select } from 'antd'

interface Props {
  field: ModelFieldModel
  filterOptions?: {}
  onFilterChange?: (params: {}) => void
}

export const myDataColumn = (props: Props): ColumnType<any> => {
  const field = props.field
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

  let header = <div>{field.name}</div>
  switch (field.fieldType) {
    case FieldType.Unknown:
      break
    case FieldType.Integer:
      break
    case FieldType.Float:
      break
    case FieldType.SingleLineText:
      break
    case FieldType.MultipleLinesText:
      break
    case FieldType.JSON:
      break
    case FieldType.StringList:
      break
    case FieldType.Link:
      break
    case FieldType.RichText:
      break
    case FieldType.Enum:
      break
    case FieldType.TextEnum:
      header = (
        <Select
          defaultValue={filterOptions[filterKey] || ''}
          style={{ width: 120 }}
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
      break
    case FieldType.Tags:
      break
    case FieldType.Date:
      break
    case FieldType.Datetime:
      break
    case FieldType.ReadonlyText:
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
  return {
    title: header,
    render: (item: any) => <MyDataCell field={field} data={item} />,
  }
}

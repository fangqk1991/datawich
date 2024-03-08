import React from 'react'
import { GeneralDataHelper, ModelFieldModel, transferModelFieldToFormField } from '@fangcha/datawich-service'
import { ColumnType } from 'antd/es/table/interface'
import { commonDataColumn } from '../core/commonDataColumn'
import { MyDataCell } from './MyDataCell'

interface Props {
  field: ModelFieldModel
  filterOptions?: {}
  onFilterChange?: (params: {}) => void
  fixedColumn?: boolean
}

export const myDataColumn = (props: Props): ColumnType<any> => {
  const field = props.field
  const filterOptions = props.filterOptions || {}

  return commonDataColumn({
    ...props,
    field: transferModelFieldToFormField(props.field),
    render: (item: any) => <MyDataCell field={field} data={item} />,
    getOptionsForEnumField: () => {
      let options = field.options || []
      if (field.extrasData.constraintKey) {
        const constraintKey = GeneralDataHelper.calculateFilterKey({
          fieldKey: field.extrasData.constraintKey,
          modelKey: field.modelKey,
        })
        const constraintValue = filterOptions[constraintKey]
        if (constraintValue) {
          options = options.filter((option) => {
            const restraintValueMap = option['restraintValueMap'] || {}
            return !!restraintValueMap[constraintValue]
          })
        }
      }
      return options
    },
  })
}

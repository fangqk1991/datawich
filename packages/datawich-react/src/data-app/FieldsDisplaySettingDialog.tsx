import React, { useMemo, useState } from 'react'
import { Checkbox, Select } from 'antd'
import { DialogProps, DraggableOptionsPanel, ReactDialog } from '@fangcha/react'
import { ModelFieldModel } from '@fangcha/datawich-service'

interface Props extends DialogProps {
  allFields: ModelFieldModel[]
  mainFields: ModelFieldModel[]
  checkedList?: any[]
  fixedList?: string[]
}

export class FieldsDisplaySettingDialog extends ReactDialog<
  Props,
  {
    fixedList: string[]
    checkedList: string[]
  }
> {
  title = '管理展示字段'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const [checkedList, setCheckedList] = useState(props.checkedList || [])
      const [fixedList, setFixedList] = useState(props.fixedList || [])

      const checkedMap = useMemo(() => {
        return checkedList.reduce((result, cur) => {
          result[cur] = true
          return result
        }, {})
      }, [checkedList])

      const optionsMap = useMemo(() => {
        return props.allFields
          .map((field) => {
            return {
              label: field.name,
              value: field.filterKey,
            }
          })
          .reduce((result, item) => {
            result[item.value] = item
            return result
          }, {})
      }, [props.allFields])

      const checkedFieldOptions = useMemo(() => {
        return checkedList.map((filterKey) => optionsMap[filterKey]).filter((item) => !!item)
      }, [checkedList])

      const uncheckedFieldOptions = useMemo(() => {
        return props.allFields
          .filter((field) => !checkedMap[field.filterKey])
          .map((field) => optionsMap[field.filterKey])
          .filter((item) => !!item)
      }, [checkedMap])

      const allFieldOptions = useMemo(() => {
        return [...checkedFieldOptions, ...uncheckedFieldOptions]
      }, [checkedFieldOptions, uncheckedFieldOptions])

      props.context.handleResult = () => {
        return {
          fixedList: fixedList,
          checkedList: checkedList,
        }
      }

      return (
        <div>
          <Checkbox.Group
            style={{ display: 'block' }}
            options={allFieldOptions}
            value={checkedList}
            onChange={(checkedValues) => setCheckedList(checkedValues)}
          />
          <h4 style={{ margin: '12px 0 4px' }}>固定列展示</h4>
          <Select
            mode='multiple'
            allowClear
            style={{ width: '100%' }}
            placeholder='Please select'
            value={fixedList}
            onChange={(items) => {
              setFixedList(items)
            }}
            options={checkedFieldOptions}
          />
          <h4 style={{ margin: '12px 0 4px' }}>调整顺序</h4>
          <DraggableOptionsPanel
            options={checkedFieldOptions}
            onChange={(newOptions) => {
              setCheckedList(newOptions.map((item) => item.value))
            }}
          />
        </div>
      )
    }
  }
}

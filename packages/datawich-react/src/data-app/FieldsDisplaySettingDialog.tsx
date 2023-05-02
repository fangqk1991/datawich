import React, { useMemo, useState } from 'react'
import { Checkbox, Select } from 'antd'
import { DialogProps, DraggableOptionsPanel, ReactDialog } from '@fangcha/react'
import { SelectOption } from '@fangcha/tools'

interface Props extends DialogProps {
  options: SelectOption[]
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
      const checkedOptions = useMemo(() => {
        const optionsMap = props.options.reduce((result, item) => {
          result[item.value] = item
          return result
        }, {})
        return checkedList.map((filterKey) => optionsMap[filterKey]).filter((item) => !!item)
      }, [checkedList, props.options])

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
            options={props.options}
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
            options={checkedOptions}
          />
          <h4 style={{ margin: '12px 0 4px' }}>调整顺序</h4>
          <DraggableOptionsPanel
            options={checkedOptions}
            onChange={(newOptions) => {
              setCheckedList(newOptions.map((item) => item.value))
            }}
          />
        </div>
      )
    }
  }
}

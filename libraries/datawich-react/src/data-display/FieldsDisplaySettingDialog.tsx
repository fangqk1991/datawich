import React, { useMemo, useState } from 'react'
import { Checkbox, Select } from 'antd'
import { DialogProps, DraggableOptionsPanel, ReactDialog } from '@fangcha/react'
import { FieldHelper, FieldsDisplaySettings, FieldTypeDescriptor, ModelFieldModel } from '@fangcha/datawich-service'

interface Props extends DialogProps {
  mainFields: ModelFieldModel[]
  displaySettings: FieldsDisplaySettings
}

export class FieldsDisplaySettingDialog extends ReactDialog<Props, FieldsDisplaySettings> {
  title = '管理展示字段'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const displayItems = useMemo(
        () => FieldHelper.flattenDisplayItems(props.mainFields, props.displaySettings, true),
        [props.mainFields, props.displaySettings]
      )
      const allFields = useMemo(() => FieldHelper.expandAllFields(props.mainFields), [props.mainFields])

      const [checkedList, setCheckedList] = useState(() =>
        props.displaySettings.checkedList.length > 0
          ? props.displaySettings.checkedList
          : displayItems.map((item) => item.field.filterKey)
      )
      const [fixedList, setFixedList] = useState(() => props.displaySettings.fixedList)

      const checkedMap = useMemo(() => {
        return checkedList.reduce((result, cur) => {
          result[cur] = true
          return result
        }, {})
      }, [checkedList])

      const fieldsMap = useMemo(() => {
        return allFields.reduce((result, cur) => {
          result[cur.filterKey] = cur
          return result
        }, {} as { [p: string]: ModelFieldModel })
      }, [allFields])

      const optionsMap = useMemo(() => {
        return allFields
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
      }, [allFields])

      const checkedFieldOptions = useMemo(() => {
        return checkedList.filter((filterKey) => !!optionsMap[filterKey]).map((filterKey) => optionsMap[filterKey])
      }, [checkedList])

      const uncheckedFieldOptions = useMemo(() => {
        return allFields
          .filter((field) => !checkedMap[field.filterKey])
          .map((field) => optionsMap[field.filterKey])
          .filter((item) => !!item)
      }, [checkedMap])

      const allFieldOptions = useMemo(() => {
        return [...checkedFieldOptions, ...uncheckedFieldOptions]
      }, [checkedFieldOptions, uncheckedFieldOptions])

      props.context.handleResult = () => {
        const result: FieldsDisplaySettings = {
          fixedList: fixedList,
          checkedList: checkedList,
          hiddenFieldsMap: allFields
            .filter((field) => !checkedMap[field.filterKey])
            .reduce((result, cur) => {
              result[cur.filterKey] = true
              return result
            }, {}),
        }
        return result
      }

      return (
        <div>
          <Checkbox.Group
            style={{ display: 'block' }}
            options={allFieldOptions}
            value={checkedList}
            onChange={(checkedValues) => setCheckedList(checkedValues as string[])}
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
            options={checkedList
              .filter((filterKey) => !!fieldsMap[filterKey])
              .map((filterKey) => {
                const field = fieldsMap[filterKey]
                return {
                  value: field.filterKey,
                  label: `${field.name} (${FieldTypeDescriptor.describe(field.fieldType)})`,
                }
              })}
            onChange={(newOptions) => {
              setCheckedList(newOptions.map((item) => item.value as string))
            }}
          />
        </div>
      )
    }
  }
}

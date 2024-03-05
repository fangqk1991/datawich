import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { ProForm } from '@ant-design/pro-components'
import { Form, message } from 'antd'
import { LogicExpression, LogicExpressionHelper } from '@fangcha/logic'
import { FieldEnumType, FormField, FormFieldType, FormSchemaHelper } from '@fangcha/form-models'
import { CommonFormItem, UpdateData } from './CommonFormItem'

export interface CommonFormProps {
  fields: FormField[]
  data?: any
  forceReadonly?: boolean
  forceEditing?: boolean
}

export const CommonForm: React.FC<CommonFormProps> = forwardRef((props, ref) => {
  const [myData, setData] = useState(() => {
    const myData = props.data
      ? JSON.parse(JSON.stringify(props.data))
      : (() => {
          const data = {}
          for (const field of props.fields.filter((item) => item.extrasData.defaultValue)) {
            if (field.extrasData.fullKeys) {
              FormSchemaHelper.setDeepValue(data, field.extrasData.fullKeys, field.extrasData.defaultValue)
            } else {
              data[field.fieldKey] = field.extrasData.defaultValue
            }
          }
          return data
        })()
    props.fields
      .filter((field) => field.fieldType === FormFieldType.Date || field.fieldType === FormFieldType.Datetime)
      .forEach((field) => {
        const fullKeys = field.extrasData.fullKeys || [field.fieldKey]
        const value = FormSchemaHelper.getDeepValue(myData, fullKeys)
        if (value !== undefined && !value) {
          FormSchemaHelper.setDeepValue(myData, fullKeys, null)
        }
      })
    props.fields
      .filter((field) => field.extrasData.enumType === FieldEnumType.Multiple)
      .forEach((field) => {
        const fullKeys = field.extrasData.fullKeys || [field.fieldKey]
        const value = FormSchemaHelper.getDeepValue(myData, fullKeys)
        if (value && !Array.isArray(value)) {
          FormSchemaHelper.setDeepValue(
            myData,
            fullKeys,
            (value as string)
              .split(',')
              .map((item) => item.trim())
              .filter((item) => !!item)
          )
        }
      })
    return myData
  })

  const visibleFields = useMemo(() => {
    // TODO !!!
    const visibleLogicMap: { [fieldKey: string]: LogicExpression } = {}
    props.fields.forEach((field) => {
      if (field.extrasData.visibleLogic) {
        visibleLogicMap[field.fieldKey] = field.extrasData.visibleLogic
      }
    })
    return props.fields
      .filter((field) => {
        if (field.extrasData.notVisible) {
          return false
        }
        if (field.extrasData.notInsertable) {
          return false
        }
        return true
      })
      .filter((field) => {
        if (visibleLogicMap[field.fieldKey]) {
          return LogicExpressionHelper.calcExpression(visibleLogicMap[field.fieldKey], myData)
        }
        return true
      })
  }, [props.fields])

  const [form] = Form.useForm<any>()

  const updateData: UpdateData = (kvList) => {
    kvList.forEach((item) => {
      FormSchemaHelper.setDeepValue(myData, item.fullKeys, item.value)
      form.setFieldValue(item.fullKeys, item.value)
    })
    setData({
      ...myData,
    })
  }

  useImperativeHandle(ref, () => ({
    exportResult: () => {
      const data = form.getFieldsValue()
      visibleFields
        .filter((field) => field.extrasData.enumType === FieldEnumType.Multiple)
        .forEach((field) => {
          const fullKeys = field.extrasData.fullKeys || [field.fieldKey]
          const value = FormSchemaHelper.getDeepValue(data, fullKeys)
          if (Array.isArray(value)) {
            FormSchemaHelper.setDeepValue(data, fullKeys, value.join(','))
          }
        })
      visibleFields
        .filter((field) => field.fieldType === FormFieldType.Date)
        .forEach((field) => {
          const fullKeys = field.extrasData.fullKeys || [field.fieldKey]
          const value = FormSchemaHelper.getDeepValue(data, fullKeys)
          if (value && value.format) {
            FormSchemaHelper.setDeepValue(data, fullKeys, value.format('YYYY-MM-DD'))
          } else if (!value) {
            FormSchemaHelper.setDeepValue(data, fullKeys, null)
          }
        })
      visibleFields
        .filter((field) => field.fieldType === FormFieldType.Datetime)
        .forEach((field) => {
          const fullKeys = field.extrasData.fullKeys || [field.fieldKey]
          const value = FormSchemaHelper.getDeepValue(data, fullKeys)
          if (value && value.format) {
            FormSchemaHelper.setDeepValue(data, fullKeys, value.format())
          } else if (!value) {
            FormSchemaHelper.setDeepValue(data, fullKeys, null)
          }
        })

      const errorMap: { [p: string]: string } = FormSchemaHelper.calcSimpleInvalidMap(
        data,
        visibleFields.filter((item) => !item.extrasData.readonly)
      )
      if (Object.keys(errorMap).length > 0) {
        const errorMsg = Object.keys(errorMap)
          .map((errKey) => errorMap[errKey])
          .join('，')
        message.error(errorMsg)
        throw new Error(errorMsg)
      }
      return data
    },
  }))

  return (
    <div>
      <ProForm form={form} autoFocusFirstInput initialValues={myData} submitter={false}>
        {visibleFields.map((field) => {
          const editable = (() => {
            if (props.forceReadonly) {
              return false
            }
            if (props.forceEditing) {
              return true
            }
            return !field.extrasData.readonly
          })()
          return (
            <CommonFormItem
              key={field.extrasData.fullKeys ? field.extrasData.fullKeys.join('.') : field.fieldKey}
              field={field}
              myData={myData}
              editable={editable}
              updateData={updateData}
            />
          )
        })}
      </ProForm>
    </div>
  )
})

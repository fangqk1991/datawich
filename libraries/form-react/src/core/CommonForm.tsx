import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { ProForm } from '@ant-design/pro-components'
import { Form, message } from 'antd'
import { LogicExpression, LogicExpressionHelper } from '@fangcha/logic'
import { FieldEnumType, FormChecker, FormField, FormFieldType, FormSchemaHelper } from '@fangcha/form-models'
import { CommonFormItem, UpdateData } from './CommonFormItem'

export interface CommonFormProps {
  fields: FormField[]
  devMode?: boolean
  data?: any
  forceReadonly?: boolean
  forceEditing?: boolean
  onChange?: () => void
}

export const CommonForm: React.FC<CommonFormProps> = forwardRef((props, ref) => {
  const flattenedFields = useMemo(() => FormSchemaHelper.flattenFields(props.fields), [props.fields])
  const [myData, setData] = useState(() => {
    const myData = props.data
      ? JSON.parse(JSON.stringify(props.data))
      : (() => {
          const data = {}
          for (const field of flattenedFields.filter((item) => item.defaultValue)) {
            FormSchemaHelper.setFieldValue(data, field, field.defaultValue)
          }
          return data
        })()
    flattenedFields
      .filter((field) => field.fieldType === FormFieldType.Date || field.fieldType === FormFieldType.Datetime)
      .forEach((field) => {
        const value = FormSchemaHelper.getFieldValue(myData, field)
        if (value !== undefined && !value) {
          FormSchemaHelper.setFieldValue(myData, field, null)
        }
      })
    flattenedFields
      .filter((field) => field.extras.enumType === FieldEnumType.Multiple)
      .forEach((field) => {
        const value = FormSchemaHelper.getFieldValue(myData, field)
        if (value && !Array.isArray(value)) {
          FormSchemaHelper.setFieldValue(
            myData,
            field,
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
    flattenedFields.forEach((field) => {
      if (field.extras.visibleLogic) {
        visibleLogicMap[field.fieldKey] = field.extras.visibleLogic
      }
    })
    return flattenedFields
      .filter((field) => {
        if (field.notVisible) {
          return false
        }
        if (field.notInsertable) {
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
  }, [flattenedFields])

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

  const getResult = useCallback(() => {
    const data = form.getFieldsValue()
    visibleFields
      .filter((field) => field.extras.enumType === FieldEnumType.Multiple)
      .forEach((field) => {
        const value = FormSchemaHelper.getFieldValue(data, field)
        if (Array.isArray(value)) {
          FormSchemaHelper.setFieldValue(data, field, value.join(','))
        }
      })
    visibleFields
      .filter((field) => field.fieldType === FormFieldType.Date)
      .forEach((field) => {
        const value = FormSchemaHelper.getFieldValue(data, field)
        if (value && value.format) {
          FormSchemaHelper.setFieldValue(data, field, value.format('YYYY-MM-DD'))
        } else if (!value) {
          FormSchemaHelper.setFieldValue(data, field, null)
        }
      })
    visibleFields
      .filter((field) => field.fieldType === FormFieldType.Datetime)
      .forEach((field) => {
        const value = FormSchemaHelper.getFieldValue(data, field)
        if (value && value.format) {
          FormSchemaHelper.setFieldValue(data, field, value.format())
        } else if (!value) {
          FormSchemaHelper.setFieldValue(data, field, null)
        }
      })
    return data
  }, [visibleFields])

  useImperativeHandle(ref, () => ({
    getResult: getResult,
    exportResult: () => {
      const data = getResult()
      const errorMap: { [p: string]: string } = new FormChecker(visibleFields).calcInvalidMap(data)
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
    <ProForm form={form} autoFocusFirstInput initialValues={myData} submitter={false} onChange={props.onChange}>
      {visibleFields.map((field) => {
        const editable = (() => {
          if (props.forceReadonly) {
            return false
          }
          if (props.forceEditing) {
            return true
          }
          return !field.readonly
        })()
        return (
          <CommonFormItem
            key={field.fullKeys ? field.fullKeys.join('.') : field.fieldKey}
            field={field}
            myData={myData}
            editable={editable}
            updateData={updateData}
            devMode={props.devMode}
          />
        )
      })}
    </ProForm>
  )
})

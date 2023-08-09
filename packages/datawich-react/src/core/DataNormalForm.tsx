import React, { forwardRef, useImperativeHandle, useMemo } from 'react'
import {
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components'
import { Form, message, Tooltip } from 'antd'
import { FieldType, GeneralDataChecker, ModelFieldModel } from '@fangcha/datawich-service'
import { LogicExpression, LogicExpressionHelper } from '@fangcha/logic'
import { I18nCode } from '@fangcha/tools'
import { ReactI18n } from './ReactI18n'
import { InfoCircleOutlined } from '@ant-design/icons'

interface Props {
  allFields: ModelFieldModel[]
  readonly?: boolean
  forceEditing?: boolean
  // field: ModelFieldModel
  // superField?: ModelFieldModel
  myData: any
}

export const DataNormalForm: React.FC<Props> = forwardRef((props, ref) => {
  const visibleFields = useMemo(() => {
    const visibleLogicMap: { [fieldKey: string]: LogicExpression } = {}
    props.allFields.forEach((field) => {
      if (field.extrasData.visibleLogic) {
        visibleLogicMap[field.fieldKey] = field.extrasData.visibleLogic
      }
    })
    return props.allFields.filter((field) => {
      if (visibleLogicMap[field.fieldKey]) {
        return LogicExpressionHelper.calcExpression(visibleLogicMap[field.fieldKey], props.myData)
      }
      return true
    })
  }, [props.allFields])

  const [form] = Form.useForm<any>()

  useImperativeHandle(ref, () => ({
    exportResult: () => {
      const data = form.getFieldsValue()
      props.allFields
        .filter((field) => field.fieldType === FieldType.MultiEnum)
        .forEach((field) => {
          if (Array.isArray(data[field.fieldKey])) {
            data[field.fieldKey] = data[field.fieldKey].join(',')
          }
        })
      props.allFields
        .filter((field) => field.fieldType === FieldType.Date)
        .forEach((field) => {
          if (data[field.fieldKey] && data[field.fieldKey].format) {
            data[field.fieldKey] = data[field.fieldKey].format('YYYY-MM-DD')
          } else if (!data[field.fieldKey]) {
            data[field.fieldKey] = null
          }
        })
      props.allFields
        .filter((field) => field.fieldType === FieldType.Datetime)
        .forEach((field) => {
          if (data[field.fieldKey] && data[field.fieldKey].format) {
            data[field.fieldKey] = data[field.fieldKey].format()
          } else if (!data[field.fieldKey]) {
            data[field.fieldKey] = null
          }
        })

      const errorMap: { [p: string]: string } = GeneralDataChecker.calcSimpleInvalidMap(
        data,
        props.allFields.filter((item) => !item.extrasData.readonly)
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
      <ProForm form={form} autoFocusFirstInput initialValues={props.myData} submitter={false}>
        {visibleFields.map((field) => {
          const nameI18n = field.extrasData.nameI18n || {}
          const code = ReactI18n.language === 'en' ? I18nCode.en : I18nCode.zhHans
          const fieldName = nameI18n[code] || field.name
          const editable = (() => {
            if (props.readonly) {
              return false
            }
            if (props.forceEditing) {
              return true
            }
            return !field.extrasData.readonly
          })()
          return (
            <ProForm.Item
              key={field.fieldKey}
              name={field.fieldKey}
              label={
                <div>
                  {fieldName}{' '}
                  {field.extrasData.readonly && (
                    <Tooltip title={'Readonly'}>
                      <InfoCircleOutlined />
                    </Tooltip>
                  )}
                </div>
              }
              required={!!field.required}
              style={{
                margin: 0,
              }}
            >
              {(() => {
                switch (field.fieldType) {
                  case FieldType.Integer:
                  case FieldType.Float:
                    return <ProFormDigit disabled={!editable} />
                  case FieldType.MultipleLinesText:
                  case FieldType.Link:
                  case FieldType.JSON:
                    return <ProFormTextArea disabled={!editable} />
                  case FieldType.Enum:
                  case FieldType.TextEnum: {
                    const optionsForEnumField = (() => {
                      if (!field.constraintKey) {
                        return field.options
                      }
                      const constraintValue = props.myData[field.constraintKey] || ''
                      return field.options.filter((option) => {
                        const restraintValueMap = option['restraintValueMap'] || {}
                        return !!restraintValueMap[constraintValue]
                      })
                    })()
                    if (optionsForEnumField.length < 5) {
                      return (
                        <ProFormRadio.Group options={optionsForEnumField} radioType='button' disabled={!editable} />
                      )
                    }
                    return (
                      <ProFormSelect
                        options={optionsForEnumField}
                        disabled={!editable}
                        style={{
                          width: 'auto',
                        }}
                      />
                    )
                  }
                  case FieldType.MultiEnum: {
                    return <ProFormCheckbox.Group options={field.options} disabled={!editable} />
                  }
                  case FieldType.Date:
                    return (
                      <ProFormDatePicker
                      // fieldProps={{
                      //   format: 'YYYY-MM-DD',
                      //   value: props.myData[field.fieldKey] ? dayjs(props.myData[field.fieldKey]) : null,
                      // }}
                      />
                    )
                  case FieldType.Datetime:
                    return <ProFormDateTimePicker />
                  case FieldType.StringList:
                    return <ProFormSelect mode='tags' />
                  case FieldType.RichText:
                    // TODO: RichText
                    break
                }
                return <ProFormText disabled={!editable} />
              })()}
            </ProForm.Item>
          )
        })}
      </ProForm>
    </div>
  )
})

import React, { useMemo } from 'react'
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
import { Form, Tooltip } from 'antd'
import { FieldType, GeneralDataHelper, ModelFieldModel } from '@fangcha/datawich-service'
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

export const DataNormalForm: React.FC<Props> = (props) => {
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

  const multiEnumCheckedMap = useMemo(() => {
    return props.allFields
      .filter((field) => field.fieldType === FieldType.MultiEnum)
      .reduce((result, field) => {
        result[field.fieldKey] = GeneralDataHelper.extractMultiEnumCheckedMapForValue(
          props.myData[field.fieldKey],
          field.options
        )
        return result
      }, {})
  }, [props.allFields])

  const [form] = Form.useForm<any>()
  const params = {}

  return (
    <ProForm form={form} autoFocusFirstInput initialValues={params} submitter={false}>
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
                    return <ProFormRadio.Group options={optionsForEnumField} radioType='button' disabled={!editable} />
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
                  return <ProFormDatePicker />
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
  )
}

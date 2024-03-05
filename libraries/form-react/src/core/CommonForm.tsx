import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
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
import { RichTextEditor } from '@fangcha/react/rich-text'
import { LogicExpression, LogicExpressionHelper } from '@fangcha/logic'
import { InfoCircleOutlined } from '@ant-design/icons'
import { OssFileInfo } from '@fangcha/oss-models'
import { OssUploadDialog } from '@fangcha/oss-react'
import { FormField, FormFieldType, FormSchemaHelper } from '@fangcha/form-models'
import { CodeEditor } from '../code-editor/CodeEditor'
import { BoolOptions } from '@fangcha/tools'

interface Props {
  allFields: FormField[]
  readonly?: boolean
  forceEditing?: boolean
  myData: any
}

export const CommonForm: React.FC<Props> = forwardRef((props, ref) => {
  const [myData, setData] = useState(() => {
    const myData = JSON.parse(JSON.stringify(props.myData))
    props.allFields
      .filter((field) => field.fieldType === FormFieldType.Date || field.fieldType === FormFieldType.Datetime)
      .forEach((field) => {
        if (myData[field.fieldKey] !== undefined && !myData[field.fieldKey]) {
          myData[field.fieldKey] = null
        }
      })
    props.allFields
      .filter((field) => field.extrasData.enumType === 'Multiple')
      .forEach((field) => {
        if (myData[field.fieldKey] && !Array.isArray(myData[field.fieldKey])) {
          myData[field.fieldKey] = (myData[field.fieldKey] as string)
            .split(',')
            .map((item) => item.trim())
            .filter((item) => !!item)
        }
      })
    return myData
  })

  const visibleFields = useMemo(() => {
    const visibleLogicMap: { [fieldKey: string]: LogicExpression } = {}
    props.allFields.forEach((field) => {
      if (field.extrasData.visibleLogic) {
        visibleLogicMap[field.fieldKey] = field.extrasData.visibleLogic
      }
    })
    return props.allFields.filter((field) => {
      if (visibleLogicMap[field.fieldKey]) {
        return LogicExpressionHelper.calcExpression(visibleLogicMap[field.fieldKey], myData)
      }
      return true
    })
  }, [props.allFields])

  const [form] = Form.useForm<any>()

  const updateData = (options: any) => {
    setData({
      ...myData,
      ...options,
    })
    form.setFieldsValue(options)
  }

  useImperativeHandle(ref, () => ({
    exportResult: () => {
      const data = form.getFieldsValue()
      props.allFields
        .filter((field) => field.extrasData.enumType === 'Multiple')
        .forEach((field) => {
          if (Array.isArray(data[field.fieldKey])) {
            data[field.fieldKey] = data[field.fieldKey].join(',')
          }
        })
      props.allFields
        .filter((field) => field.fieldType === FormFieldType.Date)
        .forEach((field) => {
          if (data[field.fieldKey] && data[field.fieldKey].format) {
            data[field.fieldKey] = data[field.fieldKey].format('YYYY-MM-DD')
          } else if (!data[field.fieldKey]) {
            data[field.fieldKey] = null
          }
        })
      props.allFields
        .filter((field) => field.fieldType === FormFieldType.Datetime)
        .forEach((field) => {
          if (data[field.fieldKey] && data[field.fieldKey].format) {
            data[field.fieldKey] = data[field.fieldKey].format()
          } else if (!data[field.fieldKey]) {
            data[field.fieldKey] = null
          }
        })

      const errorMap: { [p: string]: string } = FormSchemaHelper.calcSimpleInvalidMap(
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
      <ProForm form={form} autoFocusFirstInput initialValues={myData} submitter={false}>
        {visibleFields.map((field) => {
          // const nameI18n = field.extrasData.nameI18n || {}
          // const code = ReactI18n.language === 'en' ? I18nCode.en : I18nCode.zhHans
          // const fieldName = nameI18n[code] || field.name
          const fieldName = field.name
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
              required={field.extrasData.isRequired}
              style={{
                margin: 0,
              }}
            >
              {(() => {
                if (field.extrasData.enumType === 'Single') {
                  const optionsForEnumField = (() => {
                    if (!field.extrasData.constraintKey) {
                      return field.extrasData.options!
                    }
                    const constraintValue = myData[field.extrasData.constraintKey] || ''
                    return (field.extrasData.options || []).filter((option) => {
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
                        minWidth: '200px',
                      }}
                    />
                  )
                } else if (field.extrasData.enumType === 'Multiple') {
                  return <ProFormCheckbox.Group options={field.extrasData.options} disabled={!editable} />
                }
                switch (field.fieldType) {
                  case FormFieldType.String:
                    if (field.extrasData.stringType === 'RichText') {
                      return <RichTextEditor />
                    } else if (field.extrasData.stringType === 'CodeText') {
                      return <CodeEditor />
                    }
                    if (field.extrasData.multipleLines) {
                      return <ProFormTextArea disabled={!editable} />
                    }
                    return <ProFormText disabled={!editable} />
                  case FormFieldType.Number:
                    return <ProFormDigit disabled={!editable} min={Number.MIN_SAFE_INTEGER} />
                  case FormFieldType.Boolean:
                    return <ProFormRadio.Group options={BoolOptions} radioType='button' disabled={!editable} />
                  case FormFieldType.Date:
                    return (
                      <ProFormDatePicker
                      // fieldProps={{
                      //   format: 'YYYY-MM-DD',
                      //   value: myData[field.fieldKey] ? dayjs(myData[field.fieldKey]) : null,
                      // }}
                      />
                    )
                  case FormFieldType.Datetime:
                    return <ProFormDateTimePicker />
                  case FormFieldType.Object:
                    if (field.extrasData.objectType === 'StringList') {
                      return <ProFormSelect mode='tags' />
                    } else if (field.extrasData.objectType === 'Attachment') {
                      const entityKey = FormSchemaHelper.entityKey(field.fieldKey)
                      const ossFileInfo = myData[entityKey] as OssFileInfo
                      const uploadFile = () => {
                        OssUploadDialog.uploadFile(async (resource) => {
                          const fileInfo: OssFileInfo = {
                            ossKey: resource.ossKey,
                            mimeType: resource.mimeType,
                            size: resource.size,
                          }
                          updateData({
                            [field.fieldKey]: JSON.stringify(fileInfo),
                            [entityKey]: {
                              ...fileInfo,
                              url: resource.url,
                            },
                          })
                        })
                      }
                      if (!ossFileInfo) {
                        return (
                          <div style={{ marginBottom: '10px' }}>
                            <a onClick={uploadFile}>上传</a>
                          </div>
                        )
                      }
                      return (
                        <div style={{ marginBottom: '10px' }}>
                          <span>已上传</span>
                          {' | '}
                          <a href={ossFileInfo.url} target='_blank'>
                            点击查看
                          </a>
                          {editable && (
                            <>
                              {' | '}
                              <a onClick={uploadFile}>更新</a>
                              {' | '}
                              <a
                                className={'text-danger'}
                                onClick={() => {
                                  updateData({
                                    [field.fieldKey]: '',
                                    [entityKey]: null,
                                  })
                                }}
                              >
                                移除
                              </a>
                            </>
                          )}
                        </div>
                      )
                    }
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

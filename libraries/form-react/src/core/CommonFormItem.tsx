import React from 'react'
import {
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormList,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components'
import { Space, Tooltip } from 'antd'
import { RichTextEditor } from '@fangcha/react/rich-text'
import { InfoCircleOutlined } from '@ant-design/icons'
import { OssFileInfo } from '@fangcha/oss-models'
import { OssUploadDialog } from '@fangcha/oss-react'
import {
  FieldEnumType,
  FieldObjectType,
  FieldStringType,
  FormField,
  FormFieldType,
  FormSchemaHelper,
  WidgetType,
} from '@fangcha/form-models'
import { CodeEditor } from '../code-editor/CodeEditor'
import { BoolOptions } from '@fangcha/tools'
import { FormFieldExt } from './FormFieldExt'
import { JsonEditorDialog, JsonPre } from '@fangcha/react'

export type UpdateData = (kvList: { fullKeys: string[]; value: any }[]) => void

interface Props {
  field: FormFieldExt
  myData: any
  editable: boolean
  updateData?: UpdateData
  devMode?: boolean
}

export const CommonFormItem: React.FC<Props> = (props) => {
  const { field, myData, editable, updateData, devMode } = props
  // const nameI18n = field.extrasData.nameI18n || {}
  // const code = ReactI18n.language === 'en' ? I18nCode.en : I18nCode.zhHans
  // const fieldName = nameI18n[code] || field.name
  const fieldName = field.name
  const style = field.style || {}
  const fullKeys = field.fullKeys || [field.fieldKey]

  if (field.fieldType === FormFieldType.Array) {
    const itemField = field.itemField!
    const subFields = itemField.subFields || []
    const items = FormSchemaHelper.getFieldValue(myData, field) || []
    return (
      <div style={{ border: '1px solid #dee2e6', padding: '12px', marginBottom: '8px' }}>
        <ProFormList
          name={field.fullKeys || field.fieldKey}
          label={
            <div>
              {fieldName} {devMode && <span className={'text-danger'}>({fullKeys.join('.')})</span>}
              {field.readonly && (
                <Tooltip title={'Readonly'}>
                  <InfoCircleOutlined />
                </Tooltip>
              )}
            </div>
          }
          required={field.isRequired}
          style={{
            margin: 0,
          }}
        >
          {(f, index, action) => {
            if (itemField.fieldType === FormFieldType.Object) {
              return (
                <ProForm.Group>
                  <Space>
                    <ProForm.Item
                      label={'#'}
                      style={{
                        minWidth: '20px',
                      }}
                    >
                      {index + 1}
                    </ProForm.Item>
                    {subFields.map((subField) => {
                      return (
                        <CommonFormItem
                          key={subField.fullKeys ? subField.fullKeys.join('.') : subField.fieldKey}
                          field={subField}
                          myData={items[index]}
                          editable={editable}
                          devMode={devMode}
                        />
                      )
                    })}
                  </Space>
                </ProForm.Group>
              )
            }
            return (
              <ProForm.Group>
                <Space>
                  <ProForm.Item
                    style={{
                      minWidth: '20px',
                    }}
                  >
                    {index + 1}
                  </ProForm.Item>
                  <ProForm.Item name={'$entity'} style={{ margin: 0 }}>
                    {(() => {
                      switch (itemField.fieldType) {
                        case FormFieldType.String:
                          return <ProFormText disabled={!editable} />
                        case FormFieldType.Number:
                          return <ProFormDigit min={Number.MIN_SAFE_INTEGER} />
                        case FormFieldType.Boolean:
                          return <ProFormRadio.Group options={BoolOptions} radioType='button' disabled={!editable} />
                        case FormFieldType.Date:
                          return <ProFormDatePicker />
                        case FormFieldType.Datetime:
                          return <ProFormDateTimePicker />
                        case FormFieldType.Array:
                          break
                      }
                    })()}
                  </ProForm.Item>
                </Space>
              </ProForm.Group>
            )
          }}
        </ProFormList>
      </div>
    )
  }

  const value = FormSchemaHelper.getFieldValue(myData, field) || undefined

  return (
    <ProForm.Item
      name={field.fullKeys || field.fieldKey}
      label={
        <div>
          {field.label || fieldName} {devMode && <span className={'text-danger'}>({fullKeys.join('.')})</span>}
          {field.readonly && (
            <Tooltip title={'Readonly'}>
              <InfoCircleOutlined />
            </Tooltip>
          )}
        </div>
      }
      required={field.isRequired}
      style={{
        margin: 0,
      }}
    >
      {(() => {
        if (field.customFormItem) {
          return field.customFormItem({
            ...props,
            value: value,
            fullKeys: fullKeys,
          })
        }
        if (field.enumType === FieldEnumType.Single) {
          const optionsForEnumField = (() => {
            if (!field.constraintKey) {
              return field.options!
            }
            const constraintValue = myData[field.constraintKey] || ''
            return (field.options || []).filter((option) => {
              const restraintValueMap = option['restraintValueMap'] || {}
              return !!restraintValueMap[constraintValue]
            })
          })()
          if (field.uiWidget === WidgetType.Radio || optionsForEnumField.length < 8) {
            return (
              <ProFormRadio.Group
                options={optionsForEnumField}
                radioType='button'
                disabled={!editable}
                style={style}
                fieldProps={{
                  value: value,
                  onChange: (e) => {
                    updateData &&
                      updateData([
                        {
                          fullKeys: fullKeys,
                          value: e.target.value,
                        },
                      ])
                  },
                }}
              />
            )
          }
          return (
            <ProFormSelect
              options={optionsForEnumField}
              disabled={!editable}
              onChange={(value) =>
                updateData &&
                updateData([
                  {
                    fullKeys: fullKeys,
                    value: value,
                  },
                ])
              }
              style={{
                width: 'auto',
                minWidth: '200px',
                ...style,
              }}
            />
          )
        } else if (field.enumType === FieldEnumType.Multiple) {
          return <ProFormCheckbox.Group options={field.options} disabled={!editable} style={style} />
        }
        switch (field.fieldType) {
          case FormFieldType.String:
            if (field.stringType === FieldStringType.RichText) {
              return <RichTextEditor style={style} />
            } else if (field.stringType === FieldStringType.CodeText) {
              return <CodeEditor className={'mb-2'} />
            } else if (field.stringType === FieldStringType.JSON) {
              return (
                <div className={'mb-2'}>
                  <a
                    onClick={() => {
                      const dialog = JsonEditorDialog.dialogForEditing(value)
                      dialog.show((params) => {
                        updateData &&
                          updateData([
                            {
                              fullKeys: fullKeys,
                              value: JSON.stringify(params),
                            },
                          ])
                      })
                    }}
                  >
                    点击编辑
                  </a>
                  <JsonPre value={value} />
                </div>
              )
            }
            if (field.multipleLines) {
              return <ProFormTextArea disabled={!editable} style={style} />
            }
            return (
              <ProFormText
                placeholder={fieldName}
                disabled={!editable}
                style={style}
                fieldProps={{
                  value: value,
                  onChange: (e) =>
                    updateData &&
                    updateData([
                      {
                        fullKeys: fullKeys,
                        value: e.target.value,
                      },
                    ]),
                }}
              />
            )
          case FormFieldType.Number:
            return (
              <ProFormDigit
                disabled={!editable}
                min={Number.MIN_SAFE_INTEGER}
                style={style}
                fieldProps={{
                  value: value,
                  onChange: (val) =>
                    updateData &&
                    updateData([
                      {
                        fullKeys: fullKeys,
                        value: val,
                      },
                    ]),
                }}
              />
            )
          case FormFieldType.Boolean:
            return (
              <ProFormRadio.Group
                options={BoolOptions}
                radioType='button'
                disabled={!editable}
                style={style}
                fieldProps={{
                  value: value,
                  onChange: (e) => {
                    updateData &&
                      updateData([
                        {
                          fullKeys: fullKeys,
                          value: e.target.value,
                        },
                      ])
                  },
                }}
              />
            )
          case FormFieldType.Date:
            return (
              <ProFormDatePicker
                style={style}
                // fieldProps={{
                //   format: 'YYYY-MM-DD',
                //   value: myData[field.fieldKey] ? dayjs(myData[field.fieldKey]) : null,
                // }}
              />
            )
          case FormFieldType.Datetime:
            return <ProFormDateTimePicker style={style} />
          case FormFieldType.Object:
            if (field.objectType === FieldObjectType.StringList) {
              return <ProFormSelect mode='tags' style={style} />
            } else if (field.objectType === FieldObjectType.Attachment) {
              const entityKeys = FormSchemaHelper.entityKeys(fullKeys)
              const ossFileInfo = FormSchemaHelper.getDeepValue(myData, entityKeys) as OssFileInfo
              const uploadFile = () => {
                OssUploadDialog.uploadFile(async (resource) => {
                  const fileInfo: OssFileInfo = {
                    ossKey: resource.ossKey,
                    mimeType: resource.mimeType,
                    size: resource.size,
                  }
                  updateData &&
                    updateData([
                      {
                        fullKeys: fullKeys,
                        value: JSON.stringify(fileInfo),
                      },
                      {
                        fullKeys: entityKeys,
                        value: {
                          ...fileInfo,
                          url: resource.url,
                        },
                      },
                    ])
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
                          updateData &&
                            updateData([
                              {
                                fullKeys: fullKeys,
                                value: '',
                              },
                              {
                                fullKeys: entityKeys,
                                value: null,
                              },
                            ])
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
        return <ProFormText placeholder={fieldName} disabled={!editable} style={style} />
      })()}
    </ProForm.Item>
  )
}

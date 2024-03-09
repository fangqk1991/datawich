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
import { Tooltip } from 'antd'
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
} from '@fangcha/form-models'
import { CodeEditor } from '../code-editor/CodeEditor'
import { BoolOptions } from '@fangcha/tools'

export type UpdateData = (kvList: { fullKeys: string[]; value: any; field: FormField }[]) => void

interface Props {
  field: FormField
  myData: any
  editable: boolean
  updateData?: UpdateData
  devMode?: boolean
}

export const CommonFormItem: React.FC<Props> = ({ field, myData, editable, updateData, devMode }) => {
  // const nameI18n = field.extrasData.nameI18n || {}
  // const code = ReactI18n.language === 'en' ? I18nCode.en : I18nCode.zhHans
  // const fieldName = nameI18n[code] || field.name
  const fieldName = field.name
  const extras = field.extras || {}

  if (field.fieldType === FormFieldType.Array) {
    const schema = field.arraySchema!
    const subFields = schema.subFields || []
    const items = FormSchemaHelper.getFieldValue(myData, field) || []
    return (
      <div style={{ border: '1px solid #dee2e6', padding: '12px', marginBottom: '8px' }}>
        <ProFormList
          name={field.fullKeys || field.fieldKey}
          label={
            <div>
              {fieldName}{' '}
              {devMode && (
                <span className={'text-danger'}>({field.fullKeys ? field.fullKeys.join('.') : field.fieldKey})</span>
              )}
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
          <ProForm.Group>
            {subFields.map((subField, index) => {
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
          </ProForm.Group>
        </ProFormList>
      </div>
    )
  }

  return (
    <ProForm.Item
      name={field.fullKeys || field.fieldKey}
      label={
        <div>
          {fieldName}{' '}
          {devMode && (
            <span className={'text-danger'}>({field.fullKeys ? field.fullKeys.join('.') : field.fieldKey})</span>
          )}
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
        if (extras.enumType === FieldEnumType.Single) {
          const optionsForEnumField = (() => {
            if (!extras.constraintKey) {
              return extras.options!
            }
            const constraintValue = myData[extras.constraintKey] || ''
            return (extras.options || []).filter((option) => {
              const restraintValueMap = option['restraintValueMap'] || {}
              return !!restraintValueMap[constraintValue]
            })
          })()
          if (optionsForEnumField.length < 5) {
            return (
              <ProFormRadio.Group
                options={optionsForEnumField}
                radioType='button'
                disabled={!editable}
                fieldProps={{
                  onChange: (e) => {
                    updateData &&
                      updateData([
                        {
                          field: field,
                          fullKeys: field.fullKeys!,
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
                    field: field,
                    fullKeys: field.fullKeys!,
                    value: value,
                  },
                ])
              }
              style={{
                width: 'auto',
                minWidth: '200px',
              }}
            />
          )
        } else if (extras.enumType === FieldEnumType.Multiple) {
          return <ProFormCheckbox.Group options={extras.options} disabled={!editable} />
        }
        switch (field.fieldType) {
          case FormFieldType.String:
            if (extras.stringType === FieldStringType.RichText) {
              return <RichTextEditor />
            } else if (extras.stringType === FieldStringType.CodeText) {
              return <CodeEditor />
            }
            if (extras.multipleLines) {
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
            if (extras.objectType === FieldObjectType.StringList) {
              return <ProFormSelect mode='tags' />
            } else if (extras.objectType === FieldObjectType.Attachment) {
              const fullKeys = field.fullKeys || [field.fieldKey]
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
                        field: field,
                        fullKeys: fullKeys,
                        value: JSON.stringify(fileInfo),
                      },
                      {
                        field: field,
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
                                field: field,
                                fullKeys: fullKeys,
                                value: '',
                              },
                              {
                                field: field,
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
        return <ProFormText disabled={!editable} />
      })()}
    </ProForm.Item>
  )
}

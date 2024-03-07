import React from 'react'
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

export type UpdateData = (kvList: { fullKeys: string[]; value: any }[]) => void

interface Props {
  field: FormField
  myData: any
  editable: boolean
  updateData: UpdateData
}

export const CommonFormItem: React.FC<Props> = ({ field, myData, editable, updateData }) => {
  // const nameI18n = field.extrasData.nameI18n || {}
  // const code = ReactI18n.language === 'en' ? I18nCode.en : I18nCode.zhHans
  // const fieldName = nameI18n[code] || field.name
  const fieldName = field.name

  return (
    <ProForm.Item
      name={field.fullKeys || field.fieldKey}
      label={
        <div>
          {fieldName}{' '}
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
        if (field.extras.enumType === FieldEnumType.Single) {
          const optionsForEnumField = (() => {
            if (!field.extras.constraintKey) {
              return field.extras.options!
            }
            const constraintValue = myData[field.extras.constraintKey] || ''
            return (field.extras.options || []).filter((option) => {
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
        } else if (field.extras.enumType === FieldEnumType.Multiple) {
          return <ProFormCheckbox.Group options={field.extras.options} disabled={!editable} />
        }
        switch (field.fieldType) {
          case FormFieldType.String:
            if (field.extras.stringType === FieldStringType.RichText) {
              return <RichTextEditor />
            } else if (field.extras.stringType === FieldStringType.CodeText) {
              return <CodeEditor />
            }
            if (field.extras.multipleLines) {
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
            if (field.extras.objectType === FieldObjectType.StringList) {
              return <ProFormSelect mode='tags' />
            } else if (field.extras.objectType === FieldObjectType.Attachment) {
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
        return <ProFormText disabled={!editable} />
      })()}
    </ProForm.Item>
  )
}

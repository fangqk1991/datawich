import React from 'react'
import { GeneralDataHelper } from '@fangcha/datawich-service'
import { LinkOutlined } from '@ant-design/icons'
import { Image, Tag } from 'antd'
import { MyRichTextPanel, MyTagsPanel, PercentSpan, ReactPreviewDialog, TextPreviewDialog } from '@fangcha/react'
import { OssFileInfo } from '@fangcha/oss-models'
import * as moment from 'moment'
import { CodeEditor, CodeEditorDialog } from '@fangcha/form-react'
import {
  FieldEnumType,
  FieldObjectType,
  FieldStringType,
  FormField,
  FormFieldType,
  NumberFormat,
} from '@fangcha/form-models'

interface Props {
  field: FormField
  data: any
  extension?: React.ReactNode
  updateRecord?: (data: {}, params: {}) => Promise<void> | void
}

export const CommonDataCell: React.FC<Props> = (props) => {
  const field = props.field
  const dataKey = field.dataKey || field.fieldKey
  if (field.enumType && !field.value2LabelMap) {
    field.value2LabelMap = (field.options || []).reduce((result: any, cur: any) => {
      result[cur.value] = cur.label
      return result
    }, {})
  }
  return (
    <div>
      {(() => {
        const value = props.data[dataKey]
        if (field.enumType === FieldEnumType.Single) {
          return field.value2LabelMap![value]
        } else if (field.enumType === FieldEnumType.Multiple) {
          return (
            <MyTagsPanel
              inline={true}
              values={GeneralDataHelper.extractMultiEnumItems(value)}
              describeFunc={(value) => {
                return props.field.value2LabelMap![value]
              }}
              tagProps={{
                color: 'geekblue',
              }}
            />
          )
        }
        switch (field.fieldType) {
          case FormFieldType.String:
            switch (field.stringType!) {
              case FieldStringType.Normal:
                break
              case FieldStringType.Link:
                return (
                  <a href={value} target='_blank'>
                    <Tag color={'red'}>
                      <LinkOutlined /> Link
                    </Tag>
                  </a>
                )
              case FieldStringType.RichText:
                return <MyRichTextPanel style={{ width: '200px' }} htmlContent={value} />
              case FieldStringType.JSON:
                if (value && value !== '{}') {
                  return <a onClick={() => TextPreviewDialog.previewData(value)}>点击查看</a>
                }
                break
              case FieldStringType.CodeText:
                if (value && value !== '{}') {
                  return (
                    <>
                      <a
                        onClick={() => {
                          const dialog = new ReactPreviewDialog({
                            element: (
                              <CodeEditor
                                height={Math.max(window.innerHeight - 260, 250)}
                                value={value}
                                options={{ readOnly: true }}
                              />
                            ),
                          })
                          dialog.width = '90%'
                          dialog.show()
                        }}
                      >
                        查看
                      </a>
                      {props.updateRecord && (
                        <>
                          <span> / </span>
                          <a
                            onClick={() => {
                              const dialog = new CodeEditorDialog({
                                curValue: value || '',
                              })
                              dialog.show(async (content) => {
                                await props.updateRecord!(props.data, {
                                  [dataKey]: content,
                                })
                              })
                            }}
                          >
                            编辑
                          </a>
                        </>
                      )}
                    </>
                  )
                }
                break
            }
            if (field.multipleLines) {
              return <pre>{value}</pre>
            }
            break
          case FormFieldType.Number:
            if (value === null) {
              return ''
            }
            const realValue = value || 0
            if (field.numberFormat === NumberFormat.Percent || field.numberFormat === NumberFormat.PurePercent) {
              return <PercentSpan pure={field.numberFormat === NumberFormat.PurePercent} value={value || 0} />
            } else if (field.numberFormat === NumberFormat.Format) {
              const prefix = realValue < 0 ? '-' : ''
              let val = Math.abs(realValue)
              let unit
              const units = ['', 'K', 'M', 'B', 'T']
              while ((unit = units.shift()) !== undefined && val >= 1000) {
                val = val / 1000
              }
              return (
                <span style={{ color: '#28a745' }}>
                  {prefix}
                  {unit === '' ? val : val.toFixed(2)}
                  <b>{unit}</b>
                </span>
              )
              // num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              // return realValue.toLocaleString('en-US')
            } else if (typeof field.floatBits === 'number' && field.floatBits >= 0) {
              return realValue.toFixed(field.floatBits)
            }
            break
          case FormFieldType.Boolean:
            break
          case FormFieldType.Date:
            break
          case FormFieldType.Datetime:
            return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : ''
          case FormFieldType.Array:
            break
          case FormFieldType.Object:
            switch (field.objectType!) {
              case FieldObjectType.JSON:
                break
              case FieldObjectType.StringList:
                return (
                  <MyTagsPanel
                    inline={false}
                    thin={true}
                    values={value}
                    tagProps={{
                      color: 'geekblue',
                    }}
                  />
                )
              case FieldObjectType.Attachment:
                const info = props.data[GeneralDataHelper.entityKey(dataKey)] as OssFileInfo
                if (!info) {
                  break
                }
                if (info.mimeType.startsWith('image/')) {
                  return (
                    <div style={{ textAlign: 'center' }}>
                      <Image
                        style={{ maxWidth: '100px', maxHeight: '100px' }}
                        src={info.thumbnailUrl}
                        preview={{ src: info.url }}
                      />
                    </div>
                  )
                }
                return (
                  <a href={info.url} target='_blank'>
                    点击查看
                  </a>
                )
              case FieldObjectType.Form:
                break
            }
            break
        }
        return <>{value}</>
      })()}
      {props.extension}
    </div>
  )
}

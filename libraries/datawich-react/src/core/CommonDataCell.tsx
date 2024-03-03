import React from 'react'
import { CoreField, FieldType, GeneralDataHelper, NumberFormat } from '@fangcha/datawich-service'
import { LinkOutlined } from '@ant-design/icons'
import { Image, Tag } from 'antd'
import { MyRichTextPanel, MyTagsPanel, PercentSpan, ReactPreviewDialog, TextPreviewDialog } from '@fangcha/react'
import { OssFileInfo } from '@fangcha/oss-models'
import * as moment from 'moment'
import { CodeEditor } from './CodeEditor'
import { CodeEditorDialog } from './CodeEditorDialog'

interface Props {
  field: CoreField
  data: any
  extension?: React.ReactNode
  updateRecord?: (data: {}, params: {}) => Promise<void> | void
}

export const CommonDataCell: React.FC<Props> = (props) => {
  const field = props.field
  const dataKey = field.dataKey || field.fieldKey
  if ([FieldType.TextEnum, FieldType.MultiEnum].includes(field.fieldType) && !field.value2LabelMap) {
    field.value2LabelMap = (field.options || []).reduce((result: any, cur: any) => {
      result[cur.value] = cur.label
      return result
    }, {})
  }
  return (
    <div>
      {(() => {
        const value = props.data[dataKey]
        switch (field.fieldType) {
          case FieldType.Integer:
          case FieldType.Float:
            if (value === null) {
              return ''
            }
            const realValue = value || 0
            if (field.extrasData.numberFormat === NumberFormat.Percent) {
              return <PercentSpan value={value || 0} />
            } else if (field.extrasData.numberFormat === NumberFormat.Format) {
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
            } else if (typeof field.extrasData.floatBits === 'number' && field.extrasData.floatBits >= 0) {
              return realValue.toFixed(field.extrasData.floatBits)
            }
            break
          case FieldType.SingleLineText:
            break
          case FieldType.MultipleLinesText:
            return <pre>{value}</pre>
          case FieldType.CodeText:
            if (value && value !== '{}') {
              return (
                <>
                  <a
                    onClick={() => {
                      const dialog = new ReactPreviewDialog({
                        element: (
                          <CodeEditor height={window.screen.height - 260} value={value} options={{ readOnly: true }} />
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
          case FieldType.JSON:
            if (value && value !== '{}') {
              return <a onClick={() => TextPreviewDialog.previewData(value)}>点击查看</a>
            }
            break
          case FieldType.StringList:
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
          case FieldType.Link:
            return (
              <a href={value} target='_blank'>
                <Tag color={'red'}>
                  <LinkOutlined /> Link
                </Tag>
              </a>
            )
          case FieldType.RichText:
            return <MyRichTextPanel style={{ width: '200px' }} htmlContent={value} />
          case FieldType.TextEnum:
            return field.value2LabelMap![value]
          case FieldType.MultiEnum:
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
          case FieldType.Date:
            break
          case FieldType.Datetime:
            return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : ''
          case FieldType.Attachment:
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
          case FieldType.User:
            break
        }
        return <>{value}</>
      })()}
      {props.extension}
    </div>
  )
}

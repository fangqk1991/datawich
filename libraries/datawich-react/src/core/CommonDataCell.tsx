import React from 'react'
import { FieldHelper, FullDataInfo, GeneralDataHelper, ModelPanelTools } from '@fangcha/datawich-service'
import { InfoCircleFilled, LinkOutlined } from '@ant-design/icons'
import { Image, Tag, Tooltip } from 'antd'
import { FormatDigitSpan, MyRichTextPanel, MyTagsPanel, ReactPreviewDialog, TextPreviewDialog } from '@fangcha/react'
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
  WidgetType,
} from '@fangcha/form-models'
import { TemplateHelper } from '@fangcha/tools'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'
import { RecordDescriptions } from './RecordDescriptions'
import * as qs from 'qs'

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
        let element: React.ReactNode = value
        if (field.enumType === FieldEnumType.Single) {
          element = field.value2LabelMap![value]
        } else if (field.enumType === FieldEnumType.Multiple) {
          element = (
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
        } else {
          switch (field.fieldType) {
            case FormFieldType.String:
              if (field.multipleLines) {
                element = <pre style={{ whiteSpace: 'pre-wrap' }}>{value}</pre>
              }
              switch (field.stringType!) {
                case FieldStringType.Normal:
                  break
                case FieldStringType.Link:
                  element = (
                    <a href={value} target='_blank'>
                      <Tag color={'red'}>
                        <LinkOutlined /> Link
                      </Tag>
                    </a>
                  )
                  break
                case FieldStringType.RichText:
                  element = <MyRichTextPanel style={{ width: '200px' }} htmlContent={value} />
                  break
                case FieldStringType.JSON:
                  if (value && value !== '{}') {
                    element = <a onClick={() => TextPreviewDialog.previewData(value)}>点击查看</a>
                  }
                  break
                case FieldStringType.CodeText:
                  if (value && value !== '{}') {
                    element = (
                      <>
                        <a
                          onClick={() => {
                            const dialog = new ReactPreviewDialog({
                              title: field.name,
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
              break
            case FormFieldType.Number:
              if (value === null) {
                element = ''
                break
              }
              const realValue = value || 0
              if (field.numberFormat === NumberFormat.Percent || field.numberFormat === NumberFormat.PurePercent) {
                element = (
                  <FormatDigitSpan
                    mode={field.numberFormat === NumberFormat.PurePercent ? 'normal' : 'profit'}
                    usingPercent={
                      field.numberFormat === NumberFormat.Percent || field.numberFormat === NumberFormat.PurePercent
                    }
                    value={value || 0}
                  />
                )
              } else if (field.numberFormat === NumberFormat.Format) {
                element = <FormatDigitSpan mode={'normal'} value={value || 0} />
                // num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                // return realValue.toLocaleString('en-US')
              } else if (typeof field.floatBits === 'number' && field.floatBits >= 0) {
                element = realValue.toFixed(field.floatBits)
              }
              break
            case FormFieldType.Boolean:
              break
            case FormFieldType.Date:
              break
            case FormFieldType.Datetime:
              element = value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : ''
              break
            case FormFieldType.Array:
              break
            case FormFieldType.Object:
              switch (field.objectType!) {
                case FieldObjectType.JSON:
                  break
                case FieldObjectType.StringList:
                  const items = (value as string[]) || []
                  if (field.uiWidget === WidgetType.List) {
                    element = (
                      <ul
                        style={{
                          paddingInlineStart: '10px',
                          marginBlockStart: '6px',
                        }}
                      >
                        {items.map((str, index) => (
                          <li key={index}>{str}</li>
                        ))}
                      </ul>
                    )
                  } else {
                    element = (
                      <MyTagsPanel
                        inline={false}
                        thin={true}
                        values={items}
                        tagProps={{
                          color: 'geekblue',
                        }}
                      />
                    )
                  }
                  break
                case FieldObjectType.Attachment:
                  const info = props.data[GeneralDataHelper.entityKey(dataKey)] as OssFileInfo
                  if (!info) {
                    break
                  }
                  if (info.mimeType.startsWith('image/')) {
                    element = (
                      <div style={{ textAlign: 'center' }}>
                        <Image
                          style={{ maxWidth: '100px', maxHeight: '100px' }}
                          src={info.thumbnailUrl}
                          preview={{ src: info.url }}
                        />
                      </div>
                    )
                    break
                  }
                  element = (
                    <a href={info.url} target='_blank'>
                      点击查看
                    </a>
                  )
                  break
                case FieldObjectType.Form:
                  break
              }
              break
          }
        }
        if (field.tips && TemplateHelper.renderTmpl(field.tips, props.data)) {
          const tips = TemplateHelper.renderTmpl(field.tips, props.data)
          element = (
            <>
              {element}{' '}
              <Tooltip title={tips}>
                <InfoCircleFilled />
              </Tooltip>
            </>
          )
        }

        if (field.hideDetail) {
          return (
            <a
              onClick={() => {
                const dialog = new ReactPreviewDialog({
                  title: field.name,
                  element: element,
                })
                dialog.width = '90%'
                dialog.show()
              }}
            >
              点击查看
            </a>
          )
        }
        if (field.hyperlink) {
          const link = TemplateHelper.renderTmpl(field.hyperlink, props.data)
          if (link) {
            const matches = link.match(/^datawich:\/\/(\w+)\/(\w+)\/([\w-.]+)\/(\w+)(\?.*)?$/)
            if (matches) {
              const [modelKey, key, value, action, searchStr] = [
                matches[1],
                matches[2],
                matches[3],
                matches[4],
                matches[5],
              ]

              if (action === 'link') {
                return (
                  <a href={`${DatawichWebSDKConfig.pathPrefix}/${modelKey}/${key}/${value}${searchStr || ''}`}>
                    {element || action}
                  </a>
                )
              }

              return (
                <a
                  onClick={() => {
                    switch (action) {
                      case 'view':
                        break
                    }

                    const queryParams = (searchStr ? qs.parse(searchStr.replace(/^\?/, '')) : {}) as {
                      [p: string]: string
                    }
                    const dialog = new ReactPreviewDialog({
                      title: `${key} = ${value}`,
                      loadElement: async () => {
                        const request = MyRequest(
                          new CommonAPI(DatawichWebSDKConfig.apis.FullModelDataInfoGet, modelKey, key, value)
                        )
                        const response = await request.quickSend<FullDataInfo>()
                        const displaySettings = ModelPanelTools.extractDisplaySettings(response.panelInfo)
                        let displayItems = FieldHelper.flattenDisplayItems(response.mainFields, displaySettings)
                        if (queryParams['fields']) {
                          const whiteMap = queryParams['fields']
                            .split(',')
                            .map((item) => item.trim())
                            .filter((item) => !!item)
                            .reduce((result, cur) => {
                              const key = cur.includes('.') ? cur : `${modelKey}.${cur}`
                              result[key] = true
                              return result
                            }, {})
                          displayItems = displayItems.filter((item) => {
                            return whiteMap[`${item.field.modelKey}.${item.field.fieldKey}`]
                          })
                        }
                        return (
                          <RecordDescriptions modelKey={modelKey} displayItems={displayItems} record={response.data} />
                        )
                      },
                    })
                    dialog.width = '95%'
                    dialog.show()

                    // LoadingDialog.execute({
                    //   handler: async () => {
                    //     const request = MyRequest(
                    //       new CommonAPI(DatawichWebSDKConfig.apis.FullModelDataInfoGet, modelKey, key, value)
                    //     )
                    //     const response = await request.quickSend<FullDataInfo>()
                    //     const displaySettings = ModelPanelTools.extractDisplaySettings(response.panelInfo)
                    //     const displayItems = FieldHelper.flattenDisplayItems(response.mainFields, displaySettings)
                    //     showRecordDescriptions({
                    //       modelKey: modelKey,
                    //       displayItems: displayItems,
                    //       record: response.data,
                    //     })
                    //   },
                    // })
                  }}
                >
                  {element || action}
                </a>
              )
            }
            return (
              <a href={link} target={'_blank'}>
                {element || '点击跳转'}
              </a>
            )
          }
        }
        return element
      })()}
      {props.extension}
    </div>
  )
}

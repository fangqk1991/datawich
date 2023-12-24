import React, { useMemo } from 'react'
import { FieldType, GeneralDataHelper, ModelFieldModel, NumberFormat } from '@fangcha/datawich-service'
import { LinkOutlined } from '@ant-design/icons'
import { Image, Tag } from 'antd'
import { MyRichTextPanel, MyTagsPanel, TextPreviewDialog } from '@fangcha/react'
import { DataColumnExtension } from './DataColumnExtension'
import { MultiEnumContainer } from './MultiEnumContainer'
import { OssFileInfo } from '@fangcha/oss-models'
import * as moment from 'moment'

interface Props {
  field: ModelFieldModel
  superField?: ModelFieldModel
  filterOptions?: any
  tagCheckedMap?: any
  data: any
}

export const MyDataCell: React.FC<Props> = (props) => {
  const field = props.field
  const dataKey = useMemo(() => {
    return GeneralDataHelper.calculateDataKey(props.field, props.superField)
  }, [props.field, props.superField])
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
              const valueText = `${(realValue * 100).toFixed(2)}%`
              if (realValue > 0) {
                return <b style={{ color: '#28a745' }}>{valueText}</b>
              } else if (realValue < 0) {
                return <b style={{ color: '#dc3545' }}>{valueText}</b>
              } else {
                return <b>{valueText}</b>
              }
            } else if (field.extrasData.numberFormat === NumberFormat.Format) {
              let val = realValue
              let unit
              const units = ['', 'K', 'M', 'B', 'T']
              while ((unit = units.shift()) !== undefined && val >= 1000) {
                val = val / 1000
              }
              return (
                <span style={{ color: '#28a745' }}>
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
            return field.value2LabelMap[value]
          case FieldType.MultiEnum:
            return <MultiEnumContainer field={field} value={value} />
          case FieldType.Date:
            break
          case FieldType.Datetime:
            return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : ''
          case FieldType.ReadonlyText:
            break
          case FieldType.Attachment:
            const info = props.data[GeneralDataHelper.entityKey(field.dataKey)] as OssFileInfo
            if (!info) {
              break
            }
            if (info.mimeType.startsWith('image/')) {
              return (
                <div style={{ textAlign: 'center' }}>
                  <Image
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
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
          case FieldType.Group:
            break
          case FieldType.Template:
            break
          case FieldType.Dummy:
            break
        }
        return <>{value}</>
      })()}
      <DataColumnExtension field={props.field} superField={props.superField} data={props.data} />
    </div>
  )
}

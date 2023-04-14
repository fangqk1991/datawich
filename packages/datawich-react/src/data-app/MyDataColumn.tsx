import React, { useMemo } from 'react'
import { FieldType, GeneralDataHelper, ModelFieldModel } from '@fangcha/datawich-service'
import { LinkOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import { MyTagsPanel } from './MyTagsPanel'

interface Props {
  field: ModelFieldModel
  superField?: ModelFieldModel
  filterOptions?: any
  tagCheckedMap?: any
  data: any
}

export const MyDataColumn: React.FC<Props> = (props) => {
  const dataKey = useMemo(() => {
    return GeneralDataHelper.calculateDataKey(props.field, props.superField)
  }, [props.field, props.superField])
  return (
    <div>
      {(() => {
        const value = props.data[dataKey]
        switch (props.field.fieldType) {
          case FieldType.Integer:
            break
          case FieldType.Float:
            break
          case FieldType.SingleLineText:
            break
          case FieldType.MultipleLinesText:
            break
          case FieldType.JSON:
            break
          case FieldType.StringList:
            return (
              <MyTagsPanel
                inline={false}
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
                  Link <LinkOutlined />
                </Tag>
              </a>
            )
          case FieldType.RichText:
            break
          case FieldType.Enum:
            break
          case FieldType.TextEnum:
            break
          case FieldType.MultiEnum:
            break
          case FieldType.Tags:
            break
          case FieldType.Date:
            break
          case FieldType.Datetime:
            break
          case FieldType.ReadonlyText:
            break
          case FieldType.Attachment:
            break
          case FieldType.User:
            break
          case FieldType.Group:
            break
          case FieldType.Template:
            break
          case FieldType.Dummy:
            break
        }
        return <>{props.data[dataKey]}</>
      })()}
    </div>
  )
}

import React from 'react'
import { ModelFieldModel } from '@fangcha/datawich-service'
import { InfoCircleOutlined, LinkOutlined } from '@ant-design/icons'
import { InformationDialog } from '@fangcha/react'
import { Tag } from 'antd'
import { TemplateHelper } from '@fangcha/tools'
import { MyDataCell } from './MyDataCell'

interface Props {
  field: ModelFieldModel
  data: any
}

export const DataColumnExtension: React.FC<Props> = (props) => {
  const dataKey = props.field.dataKey || props.field.fieldKey

  const actions = props.field.extrasData.actions || []
  const linkActions = actions.filter((action) => action.event === 'Link')
  const refFieldLinks = props.field.refFieldLinks || []
  const outerLinks = refFieldLinks.filter((link) => !link.isInline)

  return (
    <div>
      {linkActions.map((action) => (
        <a key={action.actionId} href={TemplateHelper.renderTmpl(action.content, props.data)} target='_blank'>
          <Tag color={'red'}>
            <LinkOutlined /> {action.title}
          </Tag>
        </a>
      ))}
      {!!props.data[dataKey] && (
        <>
          {outerLinks.map((link) => (
            <Tag
              key={link.linkId}
              style={{ cursor: 'pointer' }}
              color={'red'}
              onClick={() => {
                InformationDialog.previewData({
                  title: `${props.field.name} 关联信息 -> ${link.refModel}`,
                  infos: link.referenceFields.map((field) => {
                    return {
                      label: field.name,
                      render: () => <MyDataCell field={field} data={props.data} />,
                    }
                  }),
                })
              }}
            >
              <InfoCircleOutlined /> 外联 {link.refModel}
            </Tag>
          ))}
        </>
      )}
    </div>
  )
}

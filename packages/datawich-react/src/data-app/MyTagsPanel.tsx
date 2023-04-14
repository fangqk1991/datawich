import React from 'react'
import { Tag } from 'antd'
import { TagProps } from 'antd/es/tag'

interface Props {
  values: (string | number | any)[]
  describeFunc?: (value: string | number | any) => string
  width?: string
  inline?: boolean
  tagProps?: TagProps
}

export const MyTagsPanel: React.FC<Props> = (props) => {
  const options = (props.values || []).map((value) => {
    return {
      label: props.describeFunc ? props.describeFunc(value) : `${value}`,
      value: value,
    }
  })
  return (
    <div style={{ width: props.width || 'auto' }}>
      {options.map((option) => {
        return (
          <div key={option.value} style={{ display: props.inline ? 'inline-block' : 'block' }}>
            <Tag
              {...(props.tagProps || {})}
              style={{
                whiteSpace: 'normal',
              }}
            >
              {option.label}
            </Tag>
          </div>
        )
      })}
    </div>
  )
}

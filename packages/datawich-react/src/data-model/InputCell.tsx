import { Input } from 'antd'
import React, { useState } from 'react'

interface Props {
  defaultValue?: any
  onValueChanged?: (value: any) => void
}

export const InputCell: React.FC<Props> = (props) => {
  const [value, setValue] = useState(props.defaultValue || undefined)
  return (
    <Input
      {...props}
      defaultValue={props.defaultValue}
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
      }}
      onPressEnter={() => {
        if (props.onValueChanged) {
          props.onValueChanged(value)
        }
      }}
      onBlur={() => {
        if (props.onValueChanged) {
          props.onValueChanged(value)
        }
      }}
    />
  )
}

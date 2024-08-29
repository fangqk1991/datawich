import React from 'react'
import { Descriptions } from 'antd'
import { FormFieldExt } from './FormFieldExt'
import { DescriptionsProps } from 'antd/es/descriptions'

interface Props extends DescriptionsProps {
  fields: FormFieldExt[]
  data: any
}

export const CommonDescriptions: React.FC<Props> = ({ fields, data, ...props }) => {
  return (
    <Descriptions size={'small'} bordered={true} {...props}>
      {fields.map((field) => {
        const value = data[field.fieldKey]
        return (
          <Descriptions.Item key={field.fieldKey} label={field.name}>
            {field.descriptionItem ? (
              field.descriptionItem({
                field: field,
                myData: data,
              })
            ) : (
              <>{value && typeof value !== 'object' && value}</>
            )}
          </Descriptions.Item>
        )
      })}
    </Descriptions>
  )
}

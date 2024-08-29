import React, { useMemo } from 'react'
import { Descriptions } from 'antd'
import { FormFieldExt } from './FormFieldExt'
import { DescriptionsProps } from 'antd/es/descriptions'
import { FormSchemaHelper } from '@fangcha/form-models'

interface Props extends DescriptionsProps {
  fields: FormFieldExt[]
  data: any
}

export const CommonDescriptions: React.FC<Props> = ({ fields, data, ...props }) => {
  const flattenedFields = useMemo(() => FormSchemaHelper.flattenFields(fields), [fields])
  return (
    <Descriptions size={'small'} bordered={true} {...props}>
      {flattenedFields.map((field) => {
        const value = FormSchemaHelper.getFieldValue(data, field)
        return (
          <Descriptions.Item key={field.fullKeys ? field.fullKeys.join('.') : field.fieldKey} label={field.name}>
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

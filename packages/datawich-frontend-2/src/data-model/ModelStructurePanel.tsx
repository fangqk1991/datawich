import React, { useMemo } from 'react'
import { FieldTypeDescriptor, GeneralDataFormatter, ModelFullMetadata } from '@fangcha/datawich-service'
import { Space } from 'antd'

interface Props {
  metadata: ModelFullMetadata
}

export const ModelStructurePanel: React.FC<Props> = ({ metadata }) => {
  const writeableFields = useMemo(() => {
    return metadata.modelFields
      .filter((field) => !field.isSystem)
      .map((item) => {
        return GeneralDataFormatter.formatModelField(item)
      })
  }, [metadata])

  return (
    <div style={{ fontSize: '14px' }}>
      <h4>
        {metadata.modelKey} {metadata.tagName} 配置
      </h4>
      <ul>
        {writeableFields.map((field) => (
          <li key={field.dataKey}>
            <Space>
              <b>
                {field.name} ({field.dataKey})
              </b>
              :{FieldTypeDescriptor.describe(field.fieldType)}
            </Space>
          </li>
        ))}
      </ul>
    </div>
  )
}

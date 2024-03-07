import React, { useEffect, useMemo, useState } from 'react'
import { Col, Form, Input, Radio, Row } from 'antd'
import { JsonPre } from '@fangcha/react'
import { FieldEnumType, FormBuilder, FormFieldType, SchemaFormFieldsMap } from '@fangcha/form-models'
import { CommonForm } from '../core/CommonForm'

const fieldsMap: SchemaFormFieldsMap = {
  stringItem: FormFieldType.String,
  numberItem: FormFieldType.Number,
  boolItem: FormFieldType.Boolean,
  dateItem: FormFieldType.Date,
  datetimeItem: FormFieldType.Datetime,
  singleChoice: {
    fieldType: FormFieldType.String,
    extrasData: {
      enumType: FieldEnumType.Single,
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
    },
  },
  multipleChoice: {
    fieldType: FormFieldType.String,
    name: '多选',
    extrasData: {
      enumType: FieldEnumType.Multiple,
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
    },
  },
}

const demoTextMap = {
  simple: `{
  "stringItem": "String",
  "numberItem": "Number",
  "boolItem": "Boolean",
  "dateItem": "Date",
  "datetimeItem": "Datetime",
  "singleChoice": {
    "fieldType": "String",
    "extrasData": {
      "enumType": "Single",
      "options": [
        { "label": "A",  "value": "a" },
        { "label": "B",  "value": "b" }
      ]
    }
  },
  "multipleChoice": {
    "fieldType": "String",
    "extrasData": {
      "enumType": "Multiple",
      "options": [
        { "label": "A",  "value": "a" },
        { "label": "B",  "value": "b" }
      ]
    }
  }
}`,
  full: JSON.stringify(fieldsMap, null, 2),
}

export const Example_FormPageView: React.FC = () => {
  const [demoId, setDemoId] = useState('simple')
  const [schemaText, setSchemaText] = useState('')

  useEffect(() => {
    setSchemaText(demoTextMap[demoId])
  }, [demoId])
  const [data, setData] = useState({})

  const fields = useMemo(() => {
    let fieldsMap = {}
    try {
      fieldsMap = JSON.parse(schemaText)
    } catch (e) {}
    return FormBuilder.buildFields(fieldsMap || {})
  }, [schemaText])

  return (
    <div>
      <Row style={{ height: '800px' }} gutter={20}>
        <Col span={8}>
          <h3>Schema</h3>
          <Form.Item label='示例'>
            <Radio.Group value={demoId} onChange={(e) => setDemoId(e.target.value)}>
              <Radio value='simple'>最简示例</Radio>
              <Radio value='full'>完整示例</Radio>
            </Radio.Group>
          </Form.Item>
          <Input.TextArea
            style={{ height: '90%' }}
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
          />
        </Col>
        <Col span={8}>
          <h3>Form</h3>
          <CommonForm fields={fields} />
        </Col>
        <Col span={8}>
          <h3>Data</h3>
          <JsonPre value={data} />
        </Col>
      </Row>
    </div>
  )
}

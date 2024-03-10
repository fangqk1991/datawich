import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Col, Form, Input, Radio, Row } from 'antd'
import { JsonEditorDialog, JsonPre } from '@fangcha/react'
import { FormBuilder, FormFieldType, SchemaFormFieldsMap } from '@fangcha/form-models'
import { CommonForm } from '../core/CommonForm'
import { SelectOption } from '@fangcha/tools'

const nestedFieldsMap: SchemaFormFieldsMap = {
  key1: FormFieldType.String,
  key2: FormFieldType.Number,
  subData: {
    key1: FormFieldType.String,
    key2: FormFieldType.Number,
    subData: {
      key1: FormFieldType.String,
      key2: FormFieldType.Number,
    },
    objArray: {
      fieldType: FormFieldType.Array,
      itemSchema: {
        label: FormFieldType.String,
        value: FormFieldType.Number,
      } as SchemaFormFieldsMap<SelectOption>,
    },
    stringArray: {
      fieldType: FormFieldType.Array,
      itemField: {
        fieldType: FormFieldType.String,
      },
      defaultValue: ['1', '2'],
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
    "name": "单选",
    "defaultValue": "a",
    "extras": {
      "enumType": "Single",
      "options": [
        { "label": "A",  "value": "a" },
        { "label": "B",  "value": "b" }
      ]
    }
  },
  "multipleChoices": {
    "fieldType": "String",
    "extras": {
      "enumType": "Multiple",
      "options": [
        { "label": "A",  "value": "a" },
        { "label": "B",  "value": "b" }
      ]
    }
  }
}`,
  nested: JSON.stringify(nestedFieldsMap, null, 2),
}

export const Example_FormPageView: React.FC = () => {
  const [demoId, setDemoId] = useState('nested')
  const [devMode, setDevMode] = useState(true)
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

  const formRef = useRef({
    getResult: () => null,
  })

  return (
    <div>
      <Row style={{ height: '800px' }} gutter={20}>
        <Col span={8}>
          <h3>Schema</h3>
          <div>
            <a
              onClick={() => {
                const dialog = new JsonEditorDialog({
                  title: '解析 Schema',
                  curValue: {
                    stringItem: '1',
                    numberItem: 1,
                    boolItem: true,
                    dateItem: '2024-03-06',
                    datetimeItem: '2024-03-10T23:07:45+08:00',
                    singleChoice: 'a',
                    objArray: [
                      {
                        label: 'L',
                        value: 1,
                      },
                      {
                        label: 'M',
                        value: 2,
                      },
                    ],
                    stringArray: ['1', '2'],
                    extras: {},
                  },
                })
                dialog.show(async (params) => {
                  setSchemaText(JSON.stringify(FormBuilder.transferToFieldsMap(params), null, 2))
                })
              }}
            >
              From JSON
            </a>
          </div>
          <Form.Item label='示例'>
            <Radio.Group value={demoId} onChange={(e) => setDemoId(e.target.value)}>
              <Radio value='simple'>最简示例</Radio>
              <Radio value='nested'>多级嵌套</Radio>
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
          <Form.Item label='开发模式'>
            <Radio.Group value={devMode} onChange={(e) => setDevMode(e.target.value)}>
              <Radio value={true}>True</Radio>
              <Radio value={false}>False</Radio>
            </Radio.Group>
          </Form.Item>
          <CommonForm
            ref={formRef}
            devMode={devMode}
            fields={fields}
            onChange={() => setData(formRef.current.getResult() as any)}
          />
        </Col>
        <Col span={8}>
          <h3>Data</h3>
          <JsonPre value={data} />
        </Col>
      </Row>
    </div>
  )
}

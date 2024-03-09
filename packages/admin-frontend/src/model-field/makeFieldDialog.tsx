import React from 'react'
import { DialogProps } from '@fangcha/react'
import { Tooltip } from 'antd'
import {
  FieldType,
  FieldTypeDescriptor,
  ModelFieldExtrasData,
  ModelFieldModel,
  ModelFieldParams,
  NumberFormatDescriptor,
} from '@fangcha/datawich-service'
import { NumBoolDescriptor } from '@fangcha/tools'
import { InfoCircleOutlined } from '@ant-design/icons'
import { CommonFormDialog } from '@fangcha/form-react'
import {
  FieldEnumType,
  FieldNumberType,
  FormBuilder,
  FormFieldType,
  SchemaFormFieldsMap,
  WidgetType,
} from '@fangcha/form-models'
import { FilterSymbol } from '@fangcha/logic'

interface Props {
  title?: string
  field?: ModelFieldModel
  forEditing?: boolean
}

export const makeFieldDialog = (props: Props = {}) => {
  const fields = FormBuilder.buildFields<ModelFieldParams>({
    fieldKey: {
      fieldType: FormFieldType.String,
      name: '字段 Key',
      isRequired: true,
      notModifiable: true,
    },
    fieldType: {
      fieldType: FormFieldType.String,
      name: '字段类型',
      isRequired: true,
      notModifiable: true,
      extras: {
        enumType: FieldEnumType.Single,
        options: FieldTypeDescriptor.options(),
        uiWidget: WidgetType.Radio,
      },
      defaultValue: FieldType.SingleLineText,
    },
    name: {
      fieldType: FormFieldType.String,
      name: '字段名称',
    },
    required: {
      fieldType: FormFieldType.Number,
      name: '必填',
      extras: {
        enumType: FieldEnumType.Single,
        options: NumBoolDescriptor.options(),
      },
      defaultValue: 0,
    },
    options: {
      name: '枚举选项',
      fieldType: FormFieldType.Array,
      arraySchema: {
        fieldType: FormFieldType.Object,
        subFields: [
          {
            fieldKey: 'label',
            fieldType: FormFieldType.String,
            name: '枚举名称',
          },
          {
            fieldKey: 'value',
            fieldType: FormFieldType.String,
            name: '枚举值',
          },
        ],
      },
      extras: {
        visibleLogic: {
          condition: {
            leftKey: 'fieldType',
            symbol: FilterSymbol.IN,
            rightValue: [FieldType.TextEnum, FieldType.MultiEnum],
          },
        },
      },
    },
    extrasData: {
      numberFormat: {
        fieldType: FormFieldType.String,
        name: '数字格式',
        extras: {
          enumType: FieldEnumType.Single,
          options: NumberFormatDescriptor.options(),
          visibleLogic: {
            condition: {
              leftKey: 'fieldType',
              symbol: FilterSymbol.IN,
              rightValue: [FieldType.Integer, FieldType.Float],
            },
          },
        },
      },
      floatBits: {
        fieldType: FormFieldType.Number,
        name: '小数精度',
        extras: {
          numberType: FieldNumberType.Integer,
          visibleLogic: {
            condition: {
              leftKey: 'fieldType',
              symbol: FilterSymbol.IN,
              rightValue: [FieldType.Integer, FieldType.Float],
            },
          },
        },
      },
      bigText: {
        fieldType: FormFieldType.Boolean,
        name: '超长文本',
        label: (
          <div>
            <span>超长文本</span>{' '}
            <Tooltip title={'超长文本字段内容不会在列表数据返回中携带，请求单条数据时会携带'}>
              <InfoCircleOutlined />
            </Tooltip>
          </div>
        ),
        extras: {
          visibleLogic: {
            condition: {
              leftKey: 'fieldType',
              symbol: FilterSymbol.IN,
              rightValue: [FieldType.JSON, FieldType.MultipleLinesText, FieldType.CodeText, FieldType.RichText],
            },
          },
        },
      },
    } as SchemaFormFieldsMap<Partial<ModelFieldExtrasData>>,
  })
  const dialog = new CommonFormDialog({
    title: props.title || '模型字段',
    fields: fields,
    forEditing: props.forEditing,
    data: props.field,
  })
  dialog.title = '编辑字段'
  return dialog
}

import React from 'react'
import { Tooltip } from 'antd'
import {
  FieldType,
  FieldTypeDescriptor,
  ModelFieldExtrasData,
  ModelFieldModel,
  ModelFieldParams,
} from '@fangcha/datawich-service'
import { NumBoolDescriptor, SelectOption } from '@fangcha/tools'
import { InfoCircleOutlined } from '@ant-design/icons'
import { CommonFormDialog } from '@fangcha/form-react'
import {
  FieldEnumType,
  FieldNumberType,
  FormBuilder,
  FormFieldType,
  NumberFormat,
  NumberFormatDescriptor,
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
      enumType: FieldEnumType.Single,
      options: FieldTypeDescriptor.options(),
      uiWidget: WidgetType.Radio,
      defaultValue: FieldType.SingleLineText,
    },
    name: {
      fieldType: FormFieldType.String,
      name: '字段名称',
    },
    required: {
      fieldType: FormFieldType.Number,
      name: '必填',
      enumType: FieldEnumType.Single,
      options: NumBoolDescriptor.options(),
      defaultValue: 0,
    },
    options: {
      name: '枚举选项',
      fieldType: FormFieldType.Array,
      itemSchema: {
        label: FormFieldType.String,
        value: FormFieldType.String,
      } as SchemaFormFieldsMap<SelectOption>,
      visibleLogic: {
        condition: {
          leftKey: 'fieldType',
          symbol: FilterSymbol.IN,
          rightValue: [FieldType.TextEnum, FieldType.MultiEnum],
        },
      },
    },
    extrasData: {
      numberFormat: {
        fieldType: FormFieldType.String,
        name: '数字格式',
        defaultValue: NumberFormat.Normal,
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
      floatBits: {
        fieldType: FormFieldType.Number,
        name: '小数精度',
        defaultValue: -1,
        numberType: FieldNumberType.Integer,
        visibleLogic: {
          condition: {
            leftKey: 'fieldType',
            symbol: FilterSymbol.IN,
            rightValue: [FieldType.Integer, FieldType.Float],
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
        visibleLogic: {
          condition: {
            leftKey: 'fieldType',
            symbol: FilterSymbol.IN,
            rightValue: [FieldType.JSON, FieldType.MultipleLinesText, FieldType.CodeText, FieldType.RichText],
          },
        },
      },
      fuzzySearch: {
        fieldType: FormFieldType.Boolean,
        name: '模糊搜索',
        visibleLogic: {
          condition: {
            leftKey: 'fieldType',
            symbol: FilterSymbol.IN,
            rightValue: [FieldType.SingleLineText, FieldType.StringList, FieldType.MultipleLinesText],
          },
        },
      },
      useListWidget: {
        fieldType: FormFieldType.Boolean,
        name: '使用 List 组件',
        visibleLogic: {
          condition: {
            leftKey: 'fieldType',
            symbol: FilterSymbol.EQ,
            rightValue: FieldType.StringList,
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
    transform: (result: ModelFieldParams) => {
      const data = (props.field || {}) as ModelFieldParams
      data.extrasData = data.extrasData || {}
      return {
        ...data,
        ...result,
        extrasData: {
          ...data.extrasData,
          ...result.extrasData,
        },
      }
    },
  })
  dialog.title = '编辑字段'
  return dialog
}

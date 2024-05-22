import { FormField, SchemaFormFieldsMap } from './FormSchemaModels'
import { FormFieldType, FormFieldTypeDescriptor } from './FormFieldType'
import { FieldObjectType } from './FieldObjectType'
import * as moment from 'moment'
import { FieldEnumType, FieldEnumTypeDescriptor } from './FieldEnumType'
import { WidgetType } from './WidgetType'
import { FilterSymbol, LogicSymbol } from '@fangcha/logic'
import { FieldStringType, FieldStringTypeDescriptor } from './FieldStringType'
import { SelectOption } from '@fangcha/tools'

export class FormBuilder {
  private static makeFieldName(field: FormField) {
    return (
      field.name ||
      field.fieldKey
        .split(/[.\-_ ]+/g)
        .map((item) => item.split(/(?=[A-Z]+)/).join(' '))
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join(' ')
    )
  }

  public static detectFieldType(value: any) {
    const valType = typeof value
    let fieldType = FormFieldType.String
    if (valType === 'boolean') {
      fieldType = FormFieldType.Boolean
    } else if (valType === 'number') {
      fieldType = FormFieldType.Number
    } else if (valType === 'string') {
      if (value.match(/^\d{4}-\d{2}-\d{2}$/) && moment(value).isValid()) {
        fieldType = FormFieldType.Date
      } else if (value.match(/^\d{4}-\d{2}-\d{2}/) && moment(value).isValid()) {
        fieldType = FormFieldType.Datetime
      }
    }
    return fieldType
  }

  public static transferToFieldsMap(data: {}) {
    const mapper: SchemaFormFieldsMap = {}
    Object.keys(data).forEach((key) => {
      const value = data[key]
      if (Array.isArray(value)) {
        const childValue = value[0]
        const isItemObject = !!childValue && typeof childValue === 'object'
        if (isItemObject) {
          mapper[key] = {
            fieldType: FormFieldType.Array,
            itemSchema: this.transferToFieldsMap(childValue),
            defaultValue: value,
          }
        } else {
          mapper[key] = {
            fieldType: FormFieldType.Array,
            itemField: {
              fieldType: this.detectFieldType(childValue),
            },
            defaultValue: value,
          }
        }
        return
      }
      if (value && typeof value === 'object') {
        mapper[key] = this.transferToFieldsMap(value)
        return
      }
      mapper[key] = {
        fieldType: this.detectFieldType(value),
        defaultValue: value,
      }
    })
    return mapper
  }

  public static buildFields<T extends {} = {}>(
    fieldsMap: SchemaFormFieldsMap<T>,
    parentKeys: string[] = []
  ): FormField[] {
    return Object.keys(fieldsMap)
      .filter(
        (fieldKey) =>
          !!fieldsMap[fieldKey] &&
          ((typeof fieldsMap[fieldKey] === 'string' && FormFieldTypeDescriptor.checkValueValid(fieldsMap[fieldKey])) ||
            typeof fieldsMap[fieldKey] === 'object')
      )
      .map((fieldKey) => {
        const props = (
          typeof fieldsMap[fieldKey] === 'string'
            ? {
                fieldType: fieldsMap[fieldKey],
              }
            : fieldsMap[fieldKey]
        ) as FormField
        const isForm = props.$isForm || !props.fieldType
        const field = (isForm ? { fieldType: FormFieldType.Object } : props) as FormField
        field.fieldKey = fieldKey
        field.name = this.makeFieldName(field)
        field.fullKeys = [...parentKeys, field.fieldKey]
        if (field.fieldType === FormFieldType.Array && field.itemSchema && !field.itemField) {
          field.itemField = {
            fieldType: FormFieldType.Object,
            subFields: this.buildFields(field.itemSchema),
          }
        }
        if (isForm) {
          field.fieldType = FormFieldType.Object
          field.objectType = FieldObjectType.Form
          field.subFields = this.buildFields(props as SchemaFormFieldsMap, field.fullKeys)
        }
        return field
      })
  }

  public static getFormFieldSchema(): SchemaFormFieldsMap<FormField> {
    return {
      fieldKey: {
        fieldType: FormFieldType.String,
        name: '键值',
        isRequired: true,
        notModifiable: true,
      },
      fieldType: {
        fieldType: FormFieldType.String,
        name: '字段类型',
        isRequired: true,
        notModifiable: true,
        enumType: FieldEnumType.Single,
        options: FormFieldTypeDescriptor.options(),
        uiWidget: WidgetType.Radio,
        defaultValue: FormFieldType.String,
      },
      name: {
        fieldType: FormFieldType.String,
        name: '名称',
      },
      isRequired: {
        fieldType: FormFieldType.Boolean,
        name: '必填',
      },
      defaultValue: {
        fieldType: FormFieldType.String,
        name: '默认值',
      },
      isUUID: {
        fieldType: FormFieldType.Boolean,
        name: 'UUID',
        visibleLogic: {
          condition: {
            leftKey: 'fieldType',
            symbol: FilterSymbol.EQ,
            rightValue: FormFieldType.String,
          },
        },
      },
      multipleLines: {
        fieldType: FormFieldType.Boolean,
        name: '多行文本',
        visibleLogic: {
          condition: {
            leftKey: 'fieldType',
            symbol: FilterSymbol.EQ,
            rightValue: FormFieldType.String,
          },
        },
      },
      stringType: {
        fieldType: FormFieldType.String,
        name: '文本属性',
        enumType: FieldEnumType.Single,
        options: FieldStringTypeDescriptor.options(),
        uiWidget: WidgetType.Radio,
        defaultValue: FieldStringType.Normal,
        visibleLogic: {
          condition: {
            leftKey: 'fieldType',
            symbol: FilterSymbol.EQ,
            rightValue: FormFieldType.String,
          },
        },
      },
      enumType: {
        fieldType: FormFieldType.String,
        name: '使用枚举',
        defaultValue: FieldEnumType.Single,
        enumType: FieldEnumType.Single,
        options: FieldEnumTypeDescriptor.options(),
        visibleLogic: {
          logic: LogicSymbol.OR,
          elements: [
            {
              condition: {
                leftKey: 'fieldType',
                symbol: FilterSymbol.EQ,
                rightValue: FormFieldType.Number,
              },
            },
            {
              logic: LogicSymbol.AND,
              elements: [
                {
                  condition: {
                    leftKey: 'fieldType',
                    symbol: FilterSymbol.EQ,
                    rightValue: FormFieldType.String,
                  },
                },
                {
                  condition: {
                    leftKey: 'multipleLines',
                    symbol: FilterSymbol.BoolEQ,
                    rightValue: false,
                  },
                },
                {
                  condition: {
                    leftKey: 'stringType',
                    symbol: FilterSymbol.EQ,
                    rightValue: FieldStringType.Normal,
                  },
                },
              ],
            },
          ],
        },
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
            leftKey: 'enumType',
            symbol: FilterSymbol.IN,
            rightValue: [FieldEnumType.Single, FieldEnumType.Multiple],
          },
        },
      },
      remarks: {
        fieldType: FormFieldType.String,
        name: '备注',
      },
      notVisible: {
        fieldType: FormFieldType.Boolean,
        name: '隐藏',
      },
    }
  }
}

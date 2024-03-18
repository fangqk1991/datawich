import React from 'react'
import { message, Space, Table, Tag, Tooltip } from 'antd'
import { DBTable, SdkDatabaseApis } from '@fangcha/datawich-service'
import { TableViewColumn } from '@fangcha/react'
import { CommonAPI } from '@fangcha/app-request'
import { MyRequest } from '@fangcha/auth-react'
import { CommonFormDialog } from '@fangcha/form-react'
import {
  FieldEnumType,
  FieldEnumTypeDescriptor,
  FieldStringType,
  FieldStringTypeDescriptor,
  FormBuilder,
  FormField,
  FormFieldType,
  FormFieldTypeDescriptor,
  SchemaFormFieldsMap,
  WidgetType,
} from '@fangcha/form-models'
import { FilterSymbol, LogicSymbol } from '@fangcha/logic'
import { SelectOption } from '@fangcha/tools'

interface Props {
  connectionId: string
  table: DBTable
  onDataChanged?: () => void
  hideActions?: boolean
}

export const DBTableFieldsTable: React.FC<Props> = ({ connectionId, table, onDataChanged, hideActions }) => {
  return (
    <Table
      size={'small'}
      scroll={{
        x: 'max-content',
      }}
      rowKey={(item) => item.fieldKey}
      columns={TableViewColumn.makeColumns<FormField>([
        {
          title: '字段 Key',
          render: (item) => (
            <Space>
              {item.fieldKey}
              {item.notVisible && <Tag>隐藏</Tag>}
            </Space>
          ),
        },
        {
          title: '名称',
          render: (item) => item.name,
        },
        {
          title: '字段类型',
          render: (item) => (
            <Space>
              {FormFieldTypeDescriptor.describe(item.fieldType)}
              {item.isPrimary && <Tag color={'success'}>Primary</Tag>}
              {item.isUUID && <Tag color={'success'}>UUID</Tag>}
              {item.isAuthor && <Tag color={'success'}>Author</Tag>}
            </Space>
          ),
        },
        {
          title: '属性',
          render: (item) => (
            <Space>
              {item.isRequired && <Tag color={'success'}>必填</Tag>}
              {item.notInsertable && <Tag color={'error'}>不可插入</Tag>}
              {item.notModifiable && <Tag color={'error'}>不可修改</Tag>}
              {item.enumType && (
                <Tooltip
                  title={
                    <ul
                      style={{
                        paddingInlineStart: '12px',
                      }}
                    >
                      {(item.options || []).map((option) => (
                        <li key={option.value}>
                          {option.value} - {option.label}
                        </li>
                      ))}
                    </ul>
                  }
                >
                  <Tag color={'geekblue'}>{FieldEnumTypeDescriptor.describe(item.enumType)}</Tag>
                </Tooltip>
              )}
            </Space>
          ),
        },
        {
          title: '默认值',
          render: (item) => item.defaultValue,
        },
        {
          title: '备注',
          render: (item) => item.remarks,
        },
        ...(hideActions
          ? []
          : [
              {
                title: '操作',
                render: (item: FormField) => (
                  <a
                    onClick={() => {
                      const fields = FormBuilder.buildFields<FormField>({
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
                            logic: LogicSymbol.AND,
                            elements: [
                              {
                                condition: {
                                  leftKey: 'stringType',
                                  symbol: FilterSymbol.EQ,
                                  rightValue: FieldStringType.Normal,
                                },
                              },
                              {
                                condition: {
                                  leftKey: 'enumType',
                                  symbol: FilterSymbol.IN,
                                  rightValue: [FieldEnumType.Single, FieldEnumType.Multiple],
                                },
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
                            logic: LogicSymbol.AND,
                            elements: [
                              {
                                condition: {
                                  leftKey: 'stringType',
                                  symbol: FilterSymbol.EQ,
                                  rightValue: FieldStringType.Normal,
                                },
                              },
                              {
                                condition: {
                                  leftKey: 'enumType',
                                  symbol: FilterSymbol.IN,
                                  rightValue: [FieldEnumType.Single, FieldEnumType.Multiple],
                                },
                              },
                            ],
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
                      })
                      const dialog = new CommonFormDialog({
                        title: '字段属性',
                        fields: fields,
                        data: item,
                        forEditing: true,
                      })
                      dialog.show(async (params) => {
                        const request = MyRequest(
                          new CommonAPI(SdkDatabaseApis.TableSchemaUpdate, connectionId, table.tableId)
                        )
                        request.setBodyData({
                          fieldsExtras: {
                            ...table.fieldsExtras,
                            [item.fieldKey]: params,
                          },
                        })
                        await request.quickSend()
                        message.success('更新成功')

                        onDataChanged && onDataChanged()
                      })
                    }}
                  >
                    编辑
                  </a>
                ),
              },
            ]),
      ])}
      dataSource={table.fields}
      pagination={false}
    />
  )
}

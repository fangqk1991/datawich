import React from 'react'
import { DataModelParams } from '@fangcha/datawich-service'
import { AccessLevel, AccessLevelDescriptor } from '@web/datawich-common/models'
import { FieldEnumType, FormBuilder, FormFieldType } from '@fangcha/form-models'
import { CommonFormDialog } from '@fangcha/form-react'
import { NumBoolDescriptor } from '@fangcha/tools'

interface Props {
  title?: string
  data?: DataModelParams
  forEditing?: boolean
}

export const makeModelDialog = (props: Partial<Props> = {}) => {
  const fields = FormBuilder.buildFields<Partial<DataModelParams>>({
    modelKey: {
      fieldType: FormFieldType.String,
      name: '模型 Key',
      isRequired: true,
      notModifiable: true,
    },
    name: {
      fieldType: FormFieldType.String,
      name: '模型名称',
      isRequired: true,
    },
    description: {
      fieldType: FormFieldType.String,
      name: '模型描述',
      multipleLines: true,
    },
    remarks: {
      fieldType: FormFieldType.String,
      name: '备注',
    },
    isOnline: {
      fieldType: FormFieldType.Number,
      name: '是否发布',
      enumType: FieldEnumType.Single,
      options: NumBoolDescriptor.options(),
      defaultValue: 1,
    },
    accessLevel: {
      fieldType: FormFieldType.String,
      name: '可访问性',
      enumType: FieldEnumType.Single,
      options: AccessLevelDescriptor.options(),
      defaultValue: AccessLevel.Protected,
    },
    isLibrary: {
      fieldType: FormFieldType.Number,
      name: '是否可关联',
      enumType: FieldEnumType.Single,
      options: NumBoolDescriptor.options(),
      defaultValue: 0,
    },
  })
  return new CommonFormDialog({
    title: props.title || '数据模型',
    fields: fields,
    forEditing: props.forEditing,
    data: props.data,
    transform: (result: DataModelParams) => {
      const data = (props.data || {}) as DataModelParams
      return {
        ...data,
        ...result,
      }
    },
  })
}

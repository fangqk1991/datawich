import React, { useEffect, useMemo, useState } from 'react'
import { DialogProps, ReactDialog, TableViewColumn } from '@fangcha/react'
import { Form, Switch, Table } from 'antd'
import { ProForm, ProFormRadio, ProFormSelect } from '@ant-design/pro-components'
import {
  DataModelModel,
  FieldLinkParams,
  FieldTypeDescriptor,
  LinkMapperInfo,
  ModelFieldModel,
} from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DataModelApis, ModelFieldApis } from '@web/datawich-common/admin-apis'
import { NumBoolDescriptor, SelectOption } from '@fangcha/tools'
import { InputCell } from '../data-model/InputCell'

interface Props extends DialogProps {
  modelKey: string
  fields: ModelFieldModel[]
  data?: FieldLinkParams
  forEditing?: boolean
}

export class FieldLinkDialog extends ReactDialog<Props, FieldLinkParams> {
  width = 800
  title = '关联'

  public rawComponent(): React.FC<Props> {
    return (props) => {
      const fieldsOptions = useMemo(() => {
        return props.fields.map((field) => {
          return {
            label: `${field.fieldKey} - ${field.name}`,
            value: field.fieldKey,
          }
        })
      }, [props.fields])

      const [params, setParams] = useState<FieldLinkParams>(
        JSON.parse(
          JSON.stringify(
            props.data ||
              ({
                modelKey: null as any,
                fieldKey: null as any,
                refModel: null as any,
                refField: null as any,
                isForeignKey: 0,
                isInline: 0,
                referenceCheckedInfos: [],
              } as FieldLinkParams)
          )
        )
      )

      const [refFields, setRefFields] = useState<ModelFieldModel[]>([])
      const [openModelOptions, setOpenModelOptions] = useState<SelectOption[]>([])
      const [openFieldOptions, setOpenFieldOptions] = useState<SelectOption[]>([])
      const [fieldLinkMap, setFieldLinkMap] = useState<{ [p: string]: LinkMapperInfo }>({})

      useEffect(() => {
        const request = MyRequest(new CommonAPI(DataModelApis.DataOpenModelListGet))
        request.quickSend().then((openModels: DataModelModel[]) => {
          const options = openModels
            .filter((model) => model.modelKey !== props.modelKey)
            .map((model) => {
              return {
                label: `${model.modelKey} - ${model.name}`,
                value: model.modelKey,
              }
            })
          setOpenModelOptions(options)
        })
      }, [])

      const reloadReferenceInfo = async () => {
        if (!params.refModel) {
          setRefFields([])
          setParams({
            ...params,
            refField: null as any,
          })
          setFieldLinkMap({})
          return
        }
        const request = MyRequest(new CommonAPI(ModelFieldApis.DataModelVisibleFieldListGet, params.refModel))
        const refFields = (await request.quickSend()) as ModelFieldModel[]
        const uniqueFields = refFields.filter((field) => field.isUnique)
        setRefFields(refFields)
        setOpenFieldOptions(
          uniqueFields.map((field) => {
            return {
              label: `${field.modelKey} - ${field.name}`,
              value: field.fieldKey,
            }
          })
        )
        setParams({
          ...params,
          refField: null as any,
        })

        setFieldLinkMap(
          params.referenceCheckedInfos.reduce((result, cur) => {
            result[cur.fieldKey] = cur
            return result
          }, {})
        )
      }

      useEffect(() => {
        reloadReferenceInfo()
      }, [params.refModel])

      const [form] = Form.useForm()
      props.context.handleResult = () => {
        const result: FieldLinkParams = {
          ...params,
          ...form.getFieldsValue(),
        }
        result.referenceCheckedInfos = refFields.map((field) => fieldLinkMap[field.fieldKey]).filter((item) => !!item)
        return result
      }

      return (
        <ProForm form={form} layout='vertical' submitter={false} initialValues={params}>
          <ProFormSelect
            name={'fieldKey'}
            label={'当前模型字段'}
            options={fieldsOptions}
            disabled={!!props.forEditing}
            style={{
              width: '100%',
            }}
          />
          <ProFormSelect
            label={'关联模型'}
            options={openModelOptions}
            style={{
              width: '100%',
            }}
            fieldProps={{
              value: params.refModel,
              onChange: (value) => {
                setParams({
                  ...params,
                  refModel: value as string,
                })
              },
            }}
          />
          <ProFormSelect
            label={'关联外键指向'}
            options={openFieldOptions}
            style={{
              width: '100%',
            }}
            fieldProps={{
              value: params.refField,
              onChange: (value) => {
                setParams({
                  ...params,
                  refField: value as string,
                })
              },
            }}
          />
          <ProFormRadio.Group
            name={'isInline'}
            label={'内联到模型'}
            options={NumBoolDescriptor.options()}
            radioType='button'
          />
          <ProForm.Item label={'关联模型内容'}>
            <Table
              size={'small'}
              rowKey={(item) => item.fieldKey}
              columns={TableViewColumn.makeColumns<ModelFieldModel>([
                {
                  title: '字段键值',
                  render: (item) => item.fieldKey,
                },
                {
                  title: '字段名',
                  render: (item) => item.name,
                },
                {
                  title: '字段类型',
                  render: (item) => FieldTypeDescriptor.describe(item.fieldType),
                },
                {
                  title: '是否选用',
                  render: (item) => {
                    const linkInfo: LinkMapperInfo = fieldLinkMap[item.fieldKey] || {
                      fieldKey: item.fieldKey,
                      mappingName: item.name,
                      checked: false,
                    }
                    return (
                      <Switch
                        checked={linkInfo.checked}
                        onChange={async (checked) => {
                          setFieldLinkMap({
                            ...fieldLinkMap,
                            [item.fieldKey]: {
                              ...linkInfo,
                              checked: checked,
                            },
                          })
                        }}
                      />
                    )
                  },
                },
                {
                  title: '内联名称',
                  render: (item) => {
                    const linkInfo: LinkMapperInfo = fieldLinkMap[item.fieldKey] || {
                      fieldKey: item.fieldKey,
                      mappingName: item.name,
                      checked: false,
                    }
                    return (
                      <InputCell
                        placeholder={item.name}
                        defaultValue={linkInfo.mappingName}
                        onValueChanged={(value) => {
                          setFieldLinkMap({
                            ...fieldLinkMap,
                            [item.fieldKey]: {
                              ...linkInfo,
                              mappingName: value,
                            },
                          })
                        }}
                      />
                    )
                  },
                },
              ])}
              dataSource={refFields}
              pagination={false}
            />
          </ProForm.Item>
        </ProForm>
      )
    }
  }
}

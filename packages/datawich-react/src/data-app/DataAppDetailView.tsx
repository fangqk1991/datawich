import React, { useEffect, useMemo, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Button, Divider, Input, message, Space, Spin } from 'antd'
import { CommonProfileApis, DataAppApis, DataModelApis, ModelFieldApis } from '@web/datawich-common/web-api'
import { DataModelModel, FieldType, GeneralDataHelper, ModelFieldModel } from '@fangcha/datawich-service'
import { Link, useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { LS } from '../core/ReactI18n'
import { MultiplePickerDialog, TableView, useQueryParams } from '@fangcha/react'
import { PageResult } from '@fangcha/tools'
import { FieldHelper, ProfileEvent } from '@web/datawich-common/models'
import { myDataColumn } from './myDataColumn'
import { useFavorAppsCtx } from '../core/FavorAppsContext'

interface DataRecord {
  rid: number
  _data_id: string
}

const trimParams = (params: {}) => {
  params = params || {}
  const newParams = {}
  Object.keys(params)
    .filter((key) => {
      return params[key] !== ''
    })
    .forEach((key) => {
      newParams[key] = params[key]
    })
  return newParams
}

export const DataAppDetailView: React.FC = () => {
  const { modelKey = '' } = useParams()
  const { queryParams, updateQueryParams } = useQueryParams<{ keywords: string }>()
  const [keywords, setKeywords] = useState(queryParams.keywords)

  const favorAppsCtx = useFavorAppsCtx()
  const favored = favorAppsCtx.checkAppFavor(modelKey)

  const [version] = useState(0)
  const [dataModel, setDataModel] = useState<DataModelModel>()
  const [mainFields, setMainFields] = useState<ModelFieldModel[]>([])
  const [hiddenFieldsMap, setHiddenFieldsMap] = useState<{ [p: string]: boolean }>({})

  const allFields = useMemo(() => {
    const items: ModelFieldModel[] = []
    for (const field of mainFields) {
      items.push(field)
      field.refFieldLinks.forEach((link) => {
        if (link.isInline) {
          items.push(...link.referenceFields)
        }
      })
    }
    return items
  }, [modelKey, mainFields])

  const fullTagsCheckedMap = useMemo(() => {
    return allFields
      .filter((field) => field.fieldType === FieldType.MultiEnum)
      .reduce((result, field) => {
        result[field.filterKey] = GeneralDataHelper.extractMultiEnumCheckedMapForValue(
          queryParams[field.filterKey] || '',
          field.options
        )
        return result
      }, {})
  }, [allFields, queryParams])

  const displayFields = useMemo(() => {
    return FieldHelper.makeDisplayFields(mainFields.filter((item) => !hiddenFieldsMap[item.filterKey]))
  }, [mainFields, hiddenFieldsMap])

  const reloadDisplaySettings = async () => {
    const request = MyRequest(
      new CommonAPI(CommonProfileApis.ProfileInfoGet, ProfileEvent.UserModelAppDisplay, modelKey)
    )
    const displaySettings = await request.quickSend()
    setHiddenFieldsMap(displaySettings.hiddenFieldsMap || {})
  }

  useEffect(() => {
    MyRequest(new CommonAPI(ModelFieldApis.DataModelVisibleFieldListGet, modelKey))
      .quickSend()
      .then((response) => {
        setMainFields(response)
      })

    MyRequest(new CommonAPI(DataModelApis.DataModelInfoGet, modelKey))
      .quickSend()
      .then((response) => {
        setDataModel(response)
      })

    reloadDisplaySettings()
  }, [modelKey])

  if (!dataModel || mainFields.length === 0) {
    return <Spin size='large' />
  }

  return (
    <div>
      <Breadcrumb
        items={[
          {
            title: <Link to={{ pathname: `/v1/all-data-app` }}>{LS('[i18n] Data Apps')}</Link>,
          },
          {
            title: (
              <Space>
                {dataModel.name} |
                <a onClick={() => favorAppsCtx.toggleAppFavor(modelKey)}>{favored ? '取消关注' : '关注'}</a>
              </Space>
            ),
          },
        ]}
      />
      <Divider style={{ margin: '12px 0' }} />
      <Space wrap={true}>
        <Input.Search
          value={keywords}
          onChange={({ target: { value } }) => setKeywords(value)}
          placeholder='Keywords'
          onSearch={(keywords: string) => {
            updateQueryParams({
              keywords: keywords,
            })
          }}
          allowClear
          enterButton
        />
        <Button
          onClick={() => {
            const dialog = new MultiplePickerDialog({
              options: allFields.map((field) => {
                return {
                  label: field.name,
                  value: field.filterKey,
                }
              }),
              checkedList: allFields.filter((item) => !hiddenFieldsMap[item.filterKey]).map((item) => item.filterKey),
            })
            dialog.title = `管理展示字段`
            dialog.show(async (checkedList) => {
              const checkedMap = checkedList.reduce((result, cur) => {
                result[`${cur}`] = true
                return result
              }, {})
              const request = MyRequest(
                new CommonAPI(CommonProfileApis.ProfileUserInfoUpdate, ProfileEvent.UserModelAppDisplay, modelKey)
              )
              request.setBodyData({
                hiddenFieldsMap: allFields
                  .filter((field) => !checkedMap[field.filterKey])
                  .reduce((result, cur) => {
                    result[cur.filterKey] = true
                    return result
                  }, {}),
              })
              await request.execute()
              message.success('调整成功')
              await reloadDisplaySettings()
            })
          }}
        >
          管理展示字段
        </Button>
      </Space>
      <Divider style={{ margin: '12px 0' }} />
      <TableView
        version={version}
        rowKey={(item: DataRecord) => {
          return `${item.rid}`
        }}
        tableProps={{
          size: 'small',
          bordered: true,
        }}
        columns={[
          ...displayFields
            .map((field) => {
              const columns = [
                myDataColumn({
                  field: field,
                  filterOptions: queryParams,
                  onFilterChange: (params) => updateQueryParams(params),
                  tagsCheckedMap: fullTagsCheckedMap[field.filterKey],
                }),
              ]
              for (const fieldLink of field.refFieldLinks.filter((item) => item.isInline)) {
                columns.push({
                  title: `${field.name} 关联`,
                  children: fieldLink.referenceFields.map((refField) =>
                    myDataColumn({
                      field: refField,
                      superField: field,
                      filterOptions: queryParams,
                      onFilterChange: (params) => updateQueryParams(params),
                      tagsCheckedMap: fullTagsCheckedMap[refField.filterKey],
                    })
                  ),
                })
              }
              return columns
            })
            .reduce((result, cur) => {
              result.push(...cur)
              return result
            }, []),
        ]}
        defaultSettings={{
          pageSize: 10,
          sortKey: 'createTime',
          sortDirection: 'descending',
        }}
        loadData={async (retainParams) => {
          const params = Object.assign({}, retainParams, queryParams)
          const request = MyRequest(new CommonAPI(DataAppApis.DataAppRecordListGetV2, modelKey))
          request.setQueryParams(trimParams(params))
          return request.quickSend<PageResult<DataRecord>>()
        }}
      />
    </div>
  )
}

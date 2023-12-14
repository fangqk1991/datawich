import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Button, Card, Divider, message, Space, Spin } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { CommonProfileApis, DataAppApis, DataModelApis, ModelFieldApis } from '@web/datawich-common/web-api'
import {
  DataModelModel,
  FieldsDisplaySettings,
  FieldType,
  GeneralDataHelper,
  ModelFieldModel,
  TagsCheckedMap,
} from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { LS } from '../core/ReactI18n'
import { ConfirmDialog, LoadingDialog, RouterLink, TableView, TableViewColumn, useQueryParams } from '@fangcha/react'
import { PageResult } from '@fangcha/tools'
import { FieldHelper, ProfileEvent } from '@web/datawich-common/models'
import { myDataColumn } from './myDataColumn'
import { useFavorAppsCtx } from '../core/FavorAppsContext'
import { GeneralDataDialog } from './GeneralDataDialog'
import { DatawichPages } from '@web/datawich-common/admin-apis'
import { DownloadTaskHelper } from '../oss/DownloadTaskHelper'
import { TextSymbol } from '@fangcha/logic'
import { DataFilterPanel } from './DataFilterPanel'
import { DataImportButton } from './DataImportButton'
import { DataCreateButton } from './DataCreateButton'

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
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)

  const { modelKey = '' } = useParams()
  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams<{ keywords: string; [p: string]: any }>()
  const [latestParams] = useState<{ entity: any }>({ entity: {} })

  const filterOptions = useMemo(() => {
    return {
      ...queryParams,
    }
  }, [queryParams])

  const [keywords, setKeywords] = useState('')
  useEffect(() => {
    setKeywords(filterOptions.keywords || '')
  }, [filterOptions.keywords])

  const favorAppsCtx = useFavorAppsCtx()
  const favored = favorAppsCtx.checkAppFavor(modelKey)

  const [version, setVersion] = useState(0)
  const [dataModel, setDataModel] = useState<DataModelModel>()
  const [mainFields, setMainFields] = useState<ModelFieldModel[]>([])
  const [displaySettings, setDisplaySettings] = useState<FieldsDisplaySettings>({
    hiddenFieldsMap: {},
    checkedList: [],
    fixedList: [],
  })

  const fixedColumnMap = useMemo(() => {
    return displaySettings.fixedList.reduce((result, cur) => {
      result[cur] = true
      return result
    }, {})
  }, [displaySettings])

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
        result[field.filterKey] = {
          includingAnyOf: GeneralDataHelper.extractMultiEnumCheckedMapForValue(
            filterOptions[`${field.filterKey}.${TextSymbol.$includeAny}`] || '',
            field.options
          ),
          includingAllOf: GeneralDataHelper.extractMultiEnumCheckedMapForValue(
            filterOptions[`${field.filterKey}.${TextSymbol.$includeAll}`] || '',
            field.options
          ),
          excludingAllOf: GeneralDataHelper.extractMultiEnumCheckedMapForValue(
            filterOptions[`${field.filterKey}.${TextSymbol.$excludeAll}`] || '',
            field.options
          ),
        }
        return result
      }, {} as { [p: string]: TagsCheckedMap })
  }, [allFields, filterOptions])

  const mainDisplayFields = useMemo(() => {
    const checkedMap = displaySettings.checkedList.reduce((result, cur) => {
      result[cur] = true
      return result
    }, {})
    let displayItems = mainFields.filter((item) => !displaySettings.hiddenFieldsMap[item.filterKey])
    const fieldMap = displayItems.reduce((result, cur) => {
      result[cur.filterKey] = cur
      return result
    }, {})
    displayItems = [
      ...displaySettings.checkedList.map((filterKey) => fieldMap[filterKey]).filter((item) => !!item),
      ...displayItems.filter((item) => !checkedMap[item.filterKey]),
    ]
    return FieldHelper.makeDisplayFields(displayItems)
  }, [mainFields, displaySettings])

  const reloadDisplaySettings = async () => {
    const request = MyRequest(
      new CommonAPI(CommonProfileApis.ProfileInfoGet, ProfileEvent.UserModelAppDisplay, modelKey)
    )
    const displaySettings = await request.quickSend<FieldsDisplaySettings>()
    displaySettings.hiddenFieldsMap = displaySettings.hiddenFieldsMap || {}
    displaySettings.checkedList = displaySettings.checkedList || []
    displaySettings.fixedList = displaySettings.fixedList || []
    setDisplaySettings(displaySettings)
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
  }, [modelKey, version])

  if (!dataModel || mainFields.length === 0) {
    return <Spin size='large' />
  }

  return (
    <div>
      <Breadcrumb
        items={[
          {
            title: <RouterLink route={DatawichPages.AllDataAppsRoute}>{LS('[i18n] Data Apps')}</RouterLink>,
          },
          {
            title: (
              <Space>
                {dataModel.name} |
                <RouterLink route={DatawichPages.ModelDetailRoute} params={[modelKey]}>
                  模型管理
                </RouterLink>
                |<a onClick={() => favorAppsCtx.toggleAppFavor(modelKey)}>{favored ? '取消关注' : '关注'}</a>
              </Space>
            ),
          },
        ]}
      />

      <Divider style={{ margin: '12px 0' }} />

      {!!dataModel.description && (
        <>
          <Card size={'small'}>
            <pre>{dataModel.description}</pre>
          </Card>
          <Divider style={{ margin: '12px 0' }} />
        </>
      )}

      <Space>
        <DataCreateButton modelKey={modelKey} fields={mainFields} onImportDone={() => forceUpdate()} />
        <DataImportButton modelKey={modelKey} fields={mainFields} onImportDone={() => forceUpdate()} />
        <Button
          onClick={async () => {
            LoadingDialog.execute({
              handler: async () => {
                const request = MyRequest(new CommonAPI(DataAppApis.DataAppExcelExport, modelKey))
                request.setBodyData(latestParams.entity)
                const response = await request.quickSend()
                DownloadTaskHelper.handleDownloadResponse(response)
              },
            })
          }}
        >
          导出 <DownloadOutlined />
        </Button>
      </Space>

      <Divider style={{ margin: '12px 0' }} />

      <DataFilterPanel
        modelKey={modelKey}
        mainFields={mainFields}
        visibleFields={mainDisplayFields}
        displaySettings={displaySettings}
        reloadDisplaySettings={reloadDisplaySettings}
      />

      <TableView
        version={version}
        rowKey={(item: DataRecord) => {
          return `${item.rid}`
        }}
        reactiveQuery={true}
        tableProps={{
          size: 'small',
          bordered: true,
        }}
        columns={TableViewColumn.makeColumns<DataRecord>([
          ...(mainDisplayFields
            .map((field) => {
              const columns = [
                myDataColumn({
                  field: field,
                  filterOptions: filterOptions,
                  onFilterChange: (params) => updateQueryParams(params),
                  tagsCheckedMap: fullTagsCheckedMap[field.filterKey],
                  fixedColumn: fixedColumnMap[field.filterKey],
                }),
              ]
              for (const fieldLink of field.refFieldLinks.filter((item) => item.isInline)) {
                columns.push({
                  title: `${field.name} 关联`,
                  children: fieldLink.referenceFields
                    .filter((refField) => !displaySettings.hiddenFieldsMap[refField.filterKey])
                    .map((refField) =>
                      myDataColumn({
                        field: refField,
                        superField: field,
                        filterOptions: filterOptions,
                        onFilterChange: (params) => updateQueryParams(params),
                        tagsCheckedMap: fullTagsCheckedMap[refField.filterKey],
                        fixedColumn: fixedColumnMap[refField.filterKey],
                      })
                    ),
                })
              }
              return columns
            })
            .reduce((result, cur) => {
              result.push(...cur)
              return result
            }, []) as any[]),
          {
            title: '操作',
            render: (item) => {
              return (
                <Space>
                  {/*<a style={{ color: '#28a745' }}>复制</a>*/}
                  <a
                    onClick={() => {
                      const inputData = FieldHelper.cleanDataByModelFields(item, mainFields)
                      const dialog = new GeneralDataDialog({
                        mainFields: mainFields,
                        modelKey: modelKey,
                        data: inputData,
                      })
                      dialog.title = '修改数据记录'
                      dialog.show(async (params) => {
                        const request = MyRequest(
                          new CommonAPI(DataAppApis.DataAppRecordUpdate, modelKey, item._data_id)
                        )
                        request.setBodyData(params)
                        await request.execute()
                        message.success('修改成功')
                        forceUpdate()
                      })
                    }}
                  >
                    编辑
                  </a>
                  <a
                    style={{ color: '#dc3545' }}
                    onClick={async () => {
                      const dialog = new ConfirmDialog({
                        content: '是否删除本记录？',
                      })
                      dialog.show(async () => {
                        const request = MyRequest(
                          new CommonAPI(DataAppApis.DataAppRecordDelete, modelKey, item._data_id)
                        )
                        await request.execute()
                        message.success('删除成功')
                        forceUpdate()
                      })
                    }}
                  >
                    删除
                  </a>
                </Space>
              )
            },
          },
        ])}
        // defaultSettings={{
        //   pageSize: Number(queryParams.pageSize) || 10,
        //   pageNumber: Number(queryParams.pageNumber) || 1,
        //   sortKey: queryParams.sortKey,
        //   sortDirection: queryParams.sortDirection,
        // }}
        loadData={async (retainParams) => {
          const params = trimParams({
            ...retainParams,
            ...filterOptions,
          })
          latestParams.entity = params
          const request = MyRequest(new CommonAPI(DataAppApis.DataAppRecordListGetV2, modelKey))
          request.setQueryParams(params)
          return request.quickSend<PageResult<DataRecord>>()
        }}
      />
    </div>
  )
}

import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Button, Card, Divider, message, Space, Spin } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import {
  CommonProfileApis,
  DataAppApis,
  DataModelApis,
  ModelFieldApis,
  ModelPanelApis,
} from '@web/datawich-common/web-api'
import {
  DataModelModel,
  FieldsDisplaySettings,
  FieldType,
  GeneralDataHelper,
  ModelFieldModel,
  ModelPanelInfo,
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
import { FilePickerDialog } from '../core/FilePickerDialog'
import { FrontendFile } from '@fangcha/tools/lib/file-frontend'
import { OssTypicalParams } from '@fangcha/oss-models'
import { OssFrontendService } from '../core/OssFrontendService'

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
  const [version, setVersion] = useState(0)

  const { modelKey = '' } = useParams()
  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams<{
    keywords: string
    panelId: string
    [p: string]: any
  }>()
  const [panelInfo, setPanelInfo] = useState<ModelPanelInfo | null>()

  const [latestParams] = useState<{ entity: any }>({ entity: {} })

  const favorAppsCtx = useFavorAppsCtx()
  const favored = favorAppsCtx.checkAppFavor(modelKey)

  const [dataModel, setDataModel] = useState<DataModelModel>()
  const [mainFields, setMainFields] = useState<ModelFieldModel[]>([])

  const displaySettings = useMemo<FieldsDisplaySettings>(() => {
    if (panelInfo) {
      return panelInfo.configData.displaySettings
    }
    return {
      hiddenFieldsMap: {},
      checkedList: [],
      fixedList: [],
    }
  }, [panelInfo])

  const fixedColumnMap = useMemo(() => {
    return displaySettings.fixedList.reduce((result, cur) => {
      result[cur] = true
      return result
    }, {})
  }, [displaySettings])

  const allFields = useMemo(() => FieldHelper.expandAllFields(mainFields), [modelKey, mainFields])

  const fullTagsCheckedMap = useMemo(() => {
    return allFields
      .filter((field) => field.fieldType === FieldType.MultiEnum)
      .reduce((result, field) => {
        result[field.filterKey] = {
          includingAnyOf: GeneralDataHelper.extractMultiEnumCheckedMapForValue(
            queryParams[`${field.filterKey}.${TextSymbol.$includeAny}`] || '',
            field.options
          ),
          includingAllOf: GeneralDataHelper.extractMultiEnumCheckedMapForValue(
            queryParams[`${field.filterKey}.${TextSymbol.$includeAll}`] || '',
            field.options
          ),
          excludingAllOf: GeneralDataHelper.extractMultiEnumCheckedMapForValue(
            queryParams[`${field.filterKey}.${TextSymbol.$excludeAll}`] || '',
            field.options
          ),
        }
        return result
      }, {} as { [p: string]: TagsCheckedMap })
  }, [allFields, queryParams])

  const displayFields = useMemo(
    () => FieldHelper.extractDisplayFields(mainFields, displaySettings),
    [mainFields, displaySettings]
  )

  useEffect(() => {
    if (queryParams.panelId === '') {
      setPanelInfo(null)
      return
    }
    if (!queryParams.panelId) {
      const request = MyRequest(
        new CommonAPI(CommonProfileApis.ProfileInfoGet, ProfileEvent.UserModelDefaultPanel, modelKey)
      )
      request.quickSend<{ panelId: string }>().then(({ panelId }) => {
        if (panelId) {
          updateQueryParams({
            panelId: panelId,
          })
        } else {
          setPanelInfo(null)
        }
      })
      return
    }
    const request = MyRequest(new CommonAPI(ModelPanelApis.ModelPanelGet, modelKey, queryParams.panelId))
    request.quickSend<ModelPanelInfo>().then((response) => {
      setPanelInfo(response)
      updateQueryParams({
        ...response.configData.queryParams,
        ...queryParams,
      })
    })
  }, [queryParams.panelId, version])

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
  }, [modelKey])

  if (!dataModel || mainFields.length === 0 || panelInfo === undefined) {
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

      <DataFilterPanel
        panelInfo={panelInfo}
        modelKey={modelKey}
        mainFields={mainFields}
        displaySettings={displaySettings}
        onPanelChanged={() => setVersion(version + 1)}
      />

      <Divider style={{ margin: '0 0 12px' }} />

      <Space style={{ marginBottom: '12px' }}>
        <DataCreateButton modelKey={modelKey} fields={mainFields} onImportDone={() => forceUpdate()} />
        <DataImportButton modelKey={modelKey} fields={mainFields} onImportDone={() => forceUpdate()} />
        <Button
          danger={true}
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
        <Button
          danger={true}
          onClick={async () => {
            const dialog = new FilePickerDialog({
              title: '上传文件 title',
              // description: '上传文件 description',
            })
            dialog.show(async (file) => {
              console.info(file)

              const fileHash = await FrontendFile.computeFileHash(file)
              const fileExt = FrontendFile.computeFileExt(file)
              const mimeType = FrontendFile.computeFileMimeType(file)
              const params: OssTypicalParams = {
                fileHash: fileHash,
                mimeType: mimeType,
                fileExt: fileExt,
                fileSize: file.size,
                bucketName: '' || OssFrontendService.options.defaultBucketName,
                ossZone: '' || OssFrontendService.options.defaultOssZone,
              }
              console.info(params)
              // const metadataDelegate: MetadataBuildProtocol = this.metadataDelegate || OssHTTP.getOssResourceMetadata
              // return await metadataDelegate(params)
            })
          }}
        >
          上传 Test
        </Button>
      </Space>

      {/*<Divider style={{ margin: '12px 0' }} />*/}

      <TableView
        rowKey={(item: DataRecord) => {
          return `${item.rid}`
        }}
        reactiveQuery={true}
        tableProps={{
          size: 'small',
          bordered: true,
        }}
        columns={TableViewColumn.makeColumns<DataRecord>([
          ...(displayFields
            .map((field) => {
              const columns = [
                myDataColumn({
                  field: field,
                  filterOptions: queryParams,
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
                        filterOptions: queryParams,
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
            ...(panelInfo ? panelInfo.configData.queryParams : {}),
            ...queryParams,
          })
          Object.keys(params)
            .filter((key) => key.endsWith('.disabled'))
            .forEach((key) => {
              delete params[key]
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

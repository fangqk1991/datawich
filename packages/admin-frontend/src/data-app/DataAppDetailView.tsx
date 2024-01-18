import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Button, Card, Divider, message, Space, Spin } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import {
  CommonProfileApis,
  DataAppApis,
  DataModelApis,
  DatawichAdminPages,
  ModelFieldApis,
  ModelPanelApis,
} from '@web/datawich-common/admin-apis'
import {
  DataModelModel,
  FieldHelper,
  FieldsDisplaySettings,
  ModelFieldModel,
  ModelPanelInfo,
} from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { LS } from '../core/ReactI18n'
import { ConfirmDialog, LoadingDialog, RouterLink, useQueryParams } from '@fangcha/react'
import { ProfileEvent } from '@web/datawich-common/models'
import { useFavorAppsCtx } from '../core/FavorAppsContext'
import { DataImportButton } from './DataImportButton'
import { DataCreateButton } from './DataCreateButton'
import { DownloadTaskHelper } from '@fangcha/oss-react'
import { GeneralDataDialog } from './GeneralDataDialog'
import { DataDisplayTable } from '@fangcha/datawich-react'
import { DataFilterPanel } from '@fangcha/datawich-react/src/filter/DataFilterPanel'

export const DataAppDetailView: React.FC = () => {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)
  const [version, setVersion] = useState(0)

  const { modelKey = '' } = useParams()
  const { queryParams, updateQueryParams } = useQueryParams<{
    keywords: string
    panelId: string
    [p: string]: any
  }>()
  const [panelInfo, setPanelInfo] = useState<ModelPanelInfo | null>()

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
            title: <RouterLink route={DatawichAdminPages.AllDataAppsRoute}>{LS('[i18n] Data Apps')}</RouterLink>,
          },
          {
            title: (
              <Space>
                {dataModel.name} |
                <RouterLink route={DatawichAdminPages.ModelDetailRoute} params={[modelKey]}>
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
        apis={{
          updateProfileInfo: CommonProfileApis.ProfileUserInfoUpdate,
          createPanel: ModelPanelApis.ModelPanelCreate,
          updatePanel: ModelPanelApis.ModelPanelUpdate,
          deletePanel: ModelPanelApis.ModelPanelDelete,
          getPanelList: ModelPanelApis.ModelPanelListGet,
        }}
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
                request.setBodyData(queryParams)
                const response = await request.quickSend()
                DownloadTaskHelper.handleDownloadResponse(response)
              },
            })
          }}
        >
          导出 <DownloadOutlined />
        </Button>
      </Space>

      {/*<Divider style={{ margin: '12px 0' }} />*/}

      <DataDisplayTable
        mainFields={mainFields}
        panelInfo={panelInfo}
        loadData={async (params) => {
          const request = MyRequest(new CommonAPI(DataAppApis.DataAppRecordListGetV2, modelKey))
          request.setQueryParams(params)
          return request.quickSend()
        }}
        extrasColumns={[
          {
            title: '操作',
            // fixed: 'right',
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
        ]}
      />
    </div>
  )
}

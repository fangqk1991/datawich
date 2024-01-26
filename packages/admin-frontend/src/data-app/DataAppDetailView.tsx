import React, { useReducer } from 'react'
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
import { FieldHelper } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { LS } from '../core/ReactI18n'
import { ConfirmDialog, LoadingDialog, RouterLink, useQueryParams } from '@fangcha/react'
import { useFavorAppsCtx } from '../core/FavorAppsContext'
import { DataImportButton } from './DataImportButton'
import { DataCreateButton } from './DataCreateButton'
import { DownloadTaskHelper } from '@fangcha/oss-react'
import { GeneralDataDialog } from './GeneralDataDialog'
import {
  DataDisplayTable,
  DataFilterPanel,
  ModelPanelProvider,
  useDataModel,
  useMainFields,
} from '@fangcha/datawich-react'

export const DataAppDetailView: React.FC = () => {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)

  const dataModel = useDataModel(DataModelApis.DataModelInfoGet)
  const mainFields = useMainFields(ModelFieldApis.DataModelVisibleFieldListGet)

  const { modelKey = '' } = useParams()
  const { queryParams } = useQueryParams<{
    keywords: string
    panelId: string
    [p: string]: any
  }>()

  const favorAppsCtx = useFavorAppsCtx()
  const favored = favorAppsCtx.checkAppFavor(modelKey)

  if (!dataModel || mainFields.length === 0) {
    return <Spin size='large' />
  }

  return (
    <ModelPanelProvider
      dataModel={dataModel}
      apis={{
        getProfileInfo: CommonProfileApis.ProfileInfoGet,
        getPanelInfo: ModelPanelApis.ModelPanelGet,
      }}
    >
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
        modelKey={modelKey}
        mainFields={mainFields}
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
        loadData={async (params) => {
          const request = MyRequest(new CommonAPI(DataAppApis.DataAppRecordListGet, modelKey))
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
                      const request = MyRequest(new CommonAPI(DataAppApis.DataAppRecordGet, modelKey, item._data_id))
                      request.quickSend().then((record) => {
                        const inputData = FieldHelper.cleanDataByModelFields(record, mainFields)
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
    </ModelPanelProvider>
  )
}

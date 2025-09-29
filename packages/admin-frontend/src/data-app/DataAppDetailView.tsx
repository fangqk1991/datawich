import React, { useCallback, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Button, Card, Divider, Space, Spin } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { DataAppApis, DatawichAdminPages } from '@web/datawich-common/admin-apis'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { LS } from '../core/ReactI18n'
import { LoadingDialog, RouterLink, useQueryParams } from '@fangcha/react'
import { DataImportButton } from './DataImportButton'
import { DownloadTaskHelper } from '@fangcha/oss-react'
import {
  DataCreateButton,
  DataDisplayTable,
  DataFilterPanel,
  useDataModelCtx,
  useFavorAppsCtx,
  useMainFields,
} from '@fangcha/datawich-react'

export const DataAppDetailView: React.FC = () => {
  const [version, setVersion] = useState(0)
  const { modelKey = '' } = useParams()

  const dataModel = useDataModelCtx().dataModel
  const mainFields = useMainFields(modelKey)

  const { queryParams } = useQueryParams<{
    keywords: string
    panelId: string
    [p: string]: any
  }>()

  const favorAppsCtx = useFavorAppsCtx()
  const favored = favorAppsCtx.checkAppFavor(modelKey)

  const loadData = useCallback(
    async (params: any) => {
      const request = MyRequest(new CommonAPI(DataAppApis.DataAppRecordListGet, modelKey))
      request.setQueryParams(params)
      return request.quickSend()
    },
    [modelKey]
  )

  if (!dataModel || mainFields.length === 0) {
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
            <pre style={{ margin: 0 }}>{dataModel.description}</pre>
          </Card>
          <Divider style={{ margin: '12px 0' }} />
        </>
      )}

      <DataFilterPanel modelKey={modelKey} mainFields={mainFields} />

      <Divider style={{ margin: '0 0 12px' }} />

      <Space style={{ marginBottom: '12px' }}>
        <DataCreateButton modelKey={modelKey} fields={mainFields} onDataChanged={() => setVersion(version + 1)} />
        <DataImportButton modelKey={modelKey} fields={mainFields} onImportDone={() => setVersion(version + 1)} />
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
        version={version}
        modelKey={modelKey}
        mainFields={mainFields}
        loadData={loadData}
        extrasColumns={[]}
        onDataChanged={() => setVersion(version + 1)}
      />
    </div>
  )
}

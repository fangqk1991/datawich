import React, { useEffect, useMemo, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Divider, Spin } from 'antd'
import { DatawichAdminPages } from '@web/datawich-common/admin-apis'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { LS } from '../core/ReactI18n'
import { RouterLink } from '@fangcha/react'
import { DatawichWebSDKConfig, RecordDescriptions } from '@fangcha/datawich-react'
import { FieldHelper, FullDataInfo } from '@fangcha/datawich-service'

export const DataAppRecordView: React.FC = () => {
  const { modelKey = '', fieldKey = '', fieldValue = '' } = useParams()

  const [fullData, setFullData] = useState<FullDataInfo>()

  useEffect(() => {
    const request = MyRequest(
      new CommonAPI(DatawichWebSDKConfig.apis.FullModelDataInfoGet, modelKey, fieldKey, fieldValue)
    )
    request.quickSend<FullDataInfo>().then((response) => setFullData(response))
  }, [modelKey, fieldKey, fieldValue])

  const displayItems = useMemo(() => {
    if (!fullData) {
      return []
    }
    return FieldHelper.flattenDisplayItems(fullData.mainFields)
  }, [fullData])

  if (!fullData) {
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
              <RouterLink route={DatawichAdminPages.DataAppDetailRoute} params={[modelKey]}>
                {fullData.dataModel.name}
              </RouterLink>
            ),
          },
          {
            title: fullData.data[fieldKey],
          },
        ]}
      />

      <Divider style={{ margin: '12px 0' }} />

      <RecordDescriptions modelKey={modelKey} displayItems={displayItems} record={fullData.data} />
    </div>
  )
}

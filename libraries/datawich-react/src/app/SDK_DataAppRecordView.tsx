import React, { useEffect, useMemo, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Divider, Spin } from 'antd'
import { FieldHelper, FullDataInfo } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { RouterLink } from '@fangcha/react'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'
import { RecordDescriptions } from '../core/RecordDescriptions'

interface Props {
  modelKey?: string
}

export const SDK_DataAppRecordView: React.FC<Props> = (props) => {
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
            title: <RouterLink route={DatawichWebSDKConfig.appListPage}>{'数据应用'}</RouterLink>,
          },
          {
            title: (
              <RouterLink route={DatawichWebSDKConfig.appDetailPage(modelKey)}>{fullData.dataModel.name}</RouterLink>
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

import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Divider, Spin, Tabs } from 'antd'
import { DataModelApis } from '@web/datawich-common/admin-apis'
import { DataModelModel } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { LS } from '../core/ReactI18n'
import { RouterLink, useQueryParams } from '@fangcha/react'
import { ModelInfoFragment } from './ModelInfoFragment'
import { ModelStructureFragment } from './ModelStructureFragment'
import { ModelAccessFragment } from './ModelAccessFragment'
import { DatawichAdminPages } from '@web/datawich-common/admin-apis'

interface DataRecord {
  rid: number
  _data_id: string
}

interface DisplaySettings {
  hiddenFieldsMap: { [p: string]: boolean }
  checkedList: string[]
  fixedList: string[]
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

export const DataModelManageView: React.FC = () => {
  const { modelKey = '' } = useParams()

  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams()

  const [version, setVersion] = useState(0)
  const [dataModel, setDataModel] = useState<DataModelModel>()

  useEffect(() => {
    MyRequest(new CommonAPI(DataModelApis.DataModelInfoGet, modelKey))
      .quickSend()
      .then((response) => {
        setDataModel(response)
      })
  }, [modelKey, version])

  if (!dataModel) {
    return <Spin size='large' />
  }

  return (
    <div>
      <Breadcrumb
        items={[
          {
            title: <RouterLink route={DatawichAdminPages.ModelListRoute}>{LS('[i18n] Model List')}</RouterLink>,
          },
          {
            title: dataModel.name,
          },
        ]}
      />
      <Divider style={{ margin: '12px 0' }} />

      <Tabs
        activeKey={queryParams['curTab'] || 'fragment-model-info'}
        onChange={(tab) => setQueryParams({ curTab: tab })}
        type='card'
        items={[
          {
            label: LS('[i18n] Basic Info'),
            key: 'fragment-model-info',
            children: <ModelInfoFragment dataModel={dataModel} onModelInfoChanged={() => setVersion(version + 1)} />,
          },
          {
            label: LS('[i18n] Field Structure'),
            key: 'fragment-model-structure',
            children: (
              <ModelStructureFragment dataModel={dataModel} onModelInfoChanged={() => setVersion(version + 1)} />
            ),
          },
          {
            label: LS('[i18n] Privacy Management'),
            key: 'fragment-access-management',
            children: <ModelAccessFragment dataModel={dataModel} onModelInfoChanged={() => setVersion(version + 1)} />,
          },
        ]}
      />
    </div>
  )
}

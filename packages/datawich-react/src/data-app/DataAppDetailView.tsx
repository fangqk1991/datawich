import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Divider, Spin } from 'antd'
import { DataAppApis, DataModelApis } from '@web/datawich-common/web-api'
import { DataModelModel } from '@fangcha/datawich-service'
import { Link, useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { LS } from '../core/ReactI18n'
import { TableView } from '@fangcha/react'
import { PageResult } from '@fangcha/tools'

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

  const [version] = useState(0)
  const [dataModel, setDataModel] = useState<DataModelModel>()

  useEffect(() => {
    MyRequest(new CommonAPI(DataModelApis.DataModelInfoGet, modelKey))
      .quickSend()
      .then((response) => {
        setDataModel(response)
      })
  }, [version])

  if (!dataModel) {
    return <Spin size='large' />
  }

  return (
    <div>
      <Breadcrumb
        items={[
          {
            title: <Link to={{ pathname: `/v1/data-app` }}>{LS('[i18n] Data Apps')}</Link>,
          },
          {
            title: dataModel.name,
          },
        ]}
      />
      <Divider style={{ margin: '12px 0' }} />
      <TableView
        version={version}
        rowKey={(item: DataRecord) => {
          return `${item.rid}`
        }}
        columns={[
          {
            title: 'rid',
            render: (item: DataRecord) => <>{item.rid}</>,
          },
        ]}
        defaultSettings={{
          pageSize: 10,
          sortKey: 'createTime',
          sortDirection: 'descending',
        }}
        loadData={async (retainParams) => {
          const request = MyRequest(new CommonAPI(DataAppApis.DataAppRecordListGetV2, modelKey))
          request.setQueryParams(trimParams(retainParams))
          return request.quickSend<PageResult<DataRecord>>()
        }}
      />
    </div>
  )
}

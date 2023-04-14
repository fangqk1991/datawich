import React, { useEffect, useMemo, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Divider, Spin } from 'antd'
import { DataAppApis, DataModelApis, ModelFieldApis } from '@web/datawich-common/web-api'
import { DataModelModel, ModelFieldModel } from '@fangcha/datawich-service'
import { Link, useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { LS } from '../core/ReactI18n'
import { TableView } from '@fangcha/react'
import { PageResult } from '@fangcha/tools'
import { FieldHelper } from '@web/datawich-common/models'
import { MyDataCell } from './MyDataCell'

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
  const [mainFields, setMainFields] = useState<ModelFieldModel[]>([])

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
  }, [mainFields])

  const displayFields = useMemo(() => {
    return FieldHelper.makeDisplayFields(mainFields)
  }, [mainFields])

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
  }, [])

  if (!dataModel || mainFields.length === 0) {
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
          ...displayFields.map((field) => {
            return {
              title: field.name,
              render: (item: DataRecord) => <MyDataCell field={field} data={item} />,
            }
          }),
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

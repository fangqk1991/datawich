import React, { useEffect, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Breadcrumb, Divider, Spin } from 'antd'
import { DataModelApis } from '@web/datawich-common/web-api'
import { DataModelModel } from '@fangcha/datawich-service'
import { Link, useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { LS } from '../core/ReactI18n'

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
            title: <Link to={{ pathname: `/v1/data-model` }}>{LS('[i18n] Model List')}</Link>,
          },
          {
            title: dataModel.name,
          },
        ]}
      />
      <Divider style={{ margin: '12px 0' }} />
    </div>
  )
}

import React, { useEffect, useMemo, useState } from 'react'
import { MyRequest } from '@fangcha/auth-react'
import { Spin } from 'antd'
import { DataModelApis, ModelFieldApis } from '@web/datawich-common/web-api'
import { DataModelModel, ModelFieldModel } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { CommonAPI } from '@fangcha/app-request'
import { DataNormalForm } from '../core/DataNormalForm'

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

export const FormDevView: React.FC = () => {
  const { modelKey = '' } = useParams()

  const [dataModel, setDataModel] = useState<DataModelModel>()
  const [mainFields, setMainFields] = useState<ModelFieldModel[]>([])

  const writeableFields = useMemo(() => {
    return mainFields.filter((field) => !field.isSystem)
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
  }, [modelKey])

  if (!dataModel || mainFields.length === 0) {
    return <Spin size='large' />
  }

  return <DataNormalForm allFields={writeableFields} myData={{}} />
}

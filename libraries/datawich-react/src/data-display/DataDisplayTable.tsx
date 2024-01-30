import React, { useMemo } from 'react'
import { FieldHelper, ModelFieldModel } from '@fangcha/datawich-service'
import { TableView, TableViewColumn, useQueryParams } from '@fangcha/react'
import { PageResult } from '@fangcha/tools'
import { myDataColumn } from './myDataColumn'
import { useModelPanel } from '../filter/ModelPanelContext'
import { RecordActionCell } from '../core/RecordActionCell'

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

interface Props {
  modelKey: string
  mainFields: ModelFieldModel[]
  loadData: (params: {}) => Promise<PageResult<DataRecord>>
  extrasColumns?: {
    title: React.ReactNode
    render: (item: DataRecord, _: DataRecord, index: number) => React.ReactNode
  }[]
  onDataChanged?: () => void
}

export const DataDisplayTable: React.FC<Props> = ({ modelKey, mainFields, extrasColumns, loadData, onDataChanged }) => {
  const { queryParams, updateQueryParams } = useQueryParams<{
    keywords: string
    panelId: string
    [p: string]: any
  }>()

  const panelCtx = useModelPanel()
  const { displaySettings, panelInfo } = panelCtx

  const fixedColumnMap = useMemo(() => {
    return displaySettings.fixedList.reduce((result, cur) => {
      result[cur] = true
      return result
    }, {})
  }, [displaySettings])

  const displayFields = useMemo(
    () => FieldHelper.extractDisplayFields(mainFields, displaySettings),
    [mainFields, displaySettings]
  )

  return (
    <TableView
      rowKey={(item: DataRecord) => {
        return `${item.rid}`
      }}
      reactiveQuery={true}
      tableProps={{
        size: 'small',
        bordered: true,
      }}
      columns={TableViewColumn.makeColumns<DataRecord>([
        ...(displayFields
          .map((field) => {
            const columns = [
              myDataColumn({
                field: field,
                filterOptions: queryParams,
                onFilterChange: (params) => updateQueryParams(params),
                fixedColumn: fixedColumnMap[field.filterKey],
              }),
            ]
            for (const fieldLink of field.refFieldLinks.filter((item) => item.isInline)) {
              columns.push({
                title: `${field.name} 关联`,
                children: fieldLink.referenceFields
                  .filter((refField) => !displaySettings.hiddenFieldsMap[refField.filterKey])
                  .map((refField) =>
                    myDataColumn({
                      field: refField,
                      superField: field,
                      filterOptions: queryParams,
                      onFilterChange: (params) => updateQueryParams(params),
                      fixedColumn: fixedColumnMap[refField.filterKey],
                    })
                  ),
              })
            }
            return columns
          })
          .reduce((result, cur) => {
            result.push(...cur)
            return result
          }, []) as any[]),
        ...(extrasColumns || []),
        {
          title: '操作',
          fixed: 'right',
          align: 'center',
          render: (item) => (
            <RecordActionCell modelKey={modelKey} mainFields={mainFields} record={item} onDataChanged={onDataChanged} />
          ),
        },
      ])}
      // defaultSettings={{
      //   pageSize: Number(queryParams.pageSize) || 10,
      //   pageNumber: Number(queryParams.pageNumber) || 1,
      //   sortKey: queryParams.sortKey,
      //   sortDirection: queryParams.sortDirection,
      // }}
      loadData={async (retainParams) => {
        const params = trimParams({
          ...retainParams,
          ...(panelInfo ? panelInfo.configData.queryParams : {}),
          ...queryParams,
        })
        Object.keys(params)
          .filter((key) => key.endsWith('.disabled'))
          .forEach((key) => {
            delete params[key]
          })
        return loadData(params)
      }}
    />
  )
}

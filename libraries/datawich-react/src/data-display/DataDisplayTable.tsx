import React, { useMemo } from 'react'
import { FieldHelper, ModelFieldModel } from '@fangcha/datawich-service'
import { TableView, TableViewColumn, useQueryParams } from '@fangcha/react'
import { PageResult } from '@fangcha/tools'
import { myDataColumn } from './myDataColumn'
import { useModelPanel } from '../filter/ModelPanelContext'
import { RecordActionCell } from '../core/RecordActionCell'
import { showDBDataDescriptions } from '../core/DBDataDescriptions'
import { showRecordDescriptions } from '../core/RecordDescriptions'

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

  const displayItems = useMemo(
    () => FieldHelper.flattenDisplayItems(mainFields, displaySettings),
    [mainFields, displaySettings]
  )

  const isMobile = window.innerWidth < 768

  return (
    <TableView
      rowKey={(item: DataRecord) => {
        return `${item.rid}`
      }}
      reactiveQuery={true}
      tableProps={{
        size: 'small',
        bordered: true,
        // onRow: (record) => {
        //   return {
        //     onDoubleClick: () => {
        //       showRecordDescriptions({
        //         modelKey: modelKey,
        //         displayItems: displayItems,
        //         record: record,
        //         extrasColumns: extrasColumns,
        //       })
        //     },
        //   }
        // },
      }}
      showTotal={true}
      columns={TableViewColumn.makeColumns<DataRecord>([
        ...(displayItems
          .filter((item) => !item.isHidden)
          .map((item) => {
            return myDataColumn({
              field: item.field,
              filterOptions: queryParams,
              onFilterChange: (params) => updateQueryParams(params),
              fixedColumn: isMobile ? undefined : fixedColumnMap[item.field.filterKey],
            })
          }) as any[]),
        ...(extrasColumns || []).map((column) => {
          if (isMobile) {
            column['fixed'] = undefined
          }
          return column
        }),
        {
          title: '操作',
          fixed: 'right',
          align: 'center',
          render: (item) => (
            <RecordActionCell
              modelKey={modelKey}
              mainFields={mainFields}
              displayItems={displayItems}
              extrasColumns={extrasColumns}
              record={item}
              onDataChanged={onDataChanged}
            />
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

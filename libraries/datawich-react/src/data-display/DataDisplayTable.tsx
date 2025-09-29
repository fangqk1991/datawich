import React, { useMemo } from 'react'
import { FieldHelper, ModelFieldModel } from '@fangcha/datawich-service'
import { TableParamsHelper, TableViewColumn, TableViewV2, useLoadingData, useQueryParams } from '@fangcha/react'
import { PageResult } from '@fangcha/tools'
import { myDataColumn } from './myDataColumn'
import { useModelPanelCtx } from '../panel/ModelPanelContext'
import { RecordActionCell } from '../core/RecordActionCell'
import { DataRecord, ExtrasColumn } from '../core/CellModels'

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
  version: number
  modelKey: string
  mainFields: ModelFieldModel[]
  loadData: (params: {}) => Promise<PageResult<DataRecord>>
  extrasColumns?: ExtrasColumn[]
  actionMenuItems?: (record: DataRecord) => React.ReactNode[]
  onRow?: (record: DataRecord) => { [p: string]: any }
  onCell?: (record: DataRecord) => { [p: string]: any }
  onDataChanged?: () => void
}

export const DataDisplayTable: React.FC<Props> = ({
  version,
  modelKey,
  mainFields,
  extrasColumns,
  actionMenuItems,
  loadData,
  onRow,
  onCell,
  onDataChanged,
}) => {
  const { queryParams, updateQueryParams } = useQueryParams<{
    keywords: string
    panelId: string
    __splash: string
    [p: string]: any
  }>()

  const panelCtx = useModelPanelCtx()
  const { displaySettings, panelInfo } = panelCtx

  // const itemsRef = useRef<DataRecord[]>([])

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

  const requestParams = useMemo(() => {
    const options = TableParamsHelper.transferQueryParams(
      trimParams({
        ...(panelInfo ? panelInfo.configData.queryParams : {}),
        ...queryParams,
      })
    )
    Object.keys(options)
      .filter((key) => key.endsWith('.disabled'))
      .forEach((key) => {
        delete options[key]
      })
    return options
  }, [queryParams])

  const { loading, data: pageResult } = useLoadingData<PageResult>(
    async () => {
      const pageResult = await loadData(requestParams)
      // itemsRef.current = pageResult.items
      return pageResult
    },
    [requestParams, loadData, version],
    { offset: 0, length: 20, totalCount: 0, items: [] }
  )

  // useEffect(() => {
  //   if (loaded && itemsRef.current.length === 1 && queryParams.__splash) {
  //     showRecordDescriptions({
  //       modelKey: modelKey,
  //       displayItems: displayItems,
  //       record: itemsRef.current[0],
  //       extrasColumns: extrasColumns,
  //     })
  //     updateQueryParams({
  //       __splash: '',
  //     })
  //   }
  // }, [loaded])

  const isMobile = window.innerWidth < 768

  return (
    <TableViewV2
      rowKey={(item: DataRecord) => {
        return `${item._data_id}`
      }}
      tableProps={{
        size: 'small',
        bordered: true,
        loading: loading,
        onRow: (record) => {
          const options: any = onRow ? onRow(record) : {}
          return {
            ...options,
            style: {
              background: record.isFavored ? '#FFFEF9' : '#FFFFFF',
              ...(options.style || {}),
            },
            // onDoubleClick: () => {
            //   showRecordDescriptions({
            //     modelKey: modelKey,
            //     displayItems: displayItems,
            //     record: record,
            //     extrasColumns: extrasColumns,
            //   })
            // },
          }
        },
      }}
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
              actionMenuItems={actionMenuItems ? actionMenuItems(item) : undefined}
              record={item}
              onDataChanged={onDataChanged}
            />
          ),
        },
      ]).map((item) => ({
        onCell: (record: any) => {
          const options: any = onCell ? onCell(record) : {}
          return {
            ...options,
          }
        },
        ...item,
      }))}
      initialSettings={queryParams as any}
      pageResult={pageResult}
      // defaultSettings={{
      //   pageSize: Number(queryParams.pageSize) || 10,
      //   pageNumber: Number(queryParams.pageNumber) || 1,
      //   sortKey: queryParams.sortKey,
      //   sortDirection: queryParams.sortDirection,
      // }}
      onParamsChanged={(params) => {
        // console.info('onParamsChanged', params)
        updateQueryParams(params as any)
      }}
    />
  )
}

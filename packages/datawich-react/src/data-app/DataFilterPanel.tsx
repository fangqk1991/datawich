import React, { useEffect, useMemo, useState } from 'react'
import { FilterItemDialog } from './FilterItemDialog'
import { CheckOutlined, DeleteOutlined, PlusSquareOutlined } from '@ant-design/icons'
import { TextSymbol } from '@fangcha/logic'
import { TinyList } from './TinyList'
import {
  FieldFilterItem,
  FieldsDisplaySettings,
  ModelFieldModel,
  ModelPanelInfo,
  ModelPanelParams,
} from '@fangcha/datawich-service'
import { LoadingView, SimpleInputDialog, useLoadingData, useQueryParams } from '@fangcha/react'
import { Button, Input, message, Space, Tag } from 'antd'
import { DataFilterItemView } from './DataFilterItemView'
import { FieldsDisplaySettingDialog } from './FieldsDisplaySettingDialog'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { CommonProfileApis, ModelPanelApis } from '@web/datawich-common/web-api'
import { FieldHelper, ProfileEvent } from '@web/datawich-common/models'

interface Props {
  panelInfo?: ModelPanelInfo | null
  modelKey: string
  mainFields: ModelFieldModel[]
  displaySettings: FieldsDisplaySettings
  onPanelChanged: () => Promise<void> | void
  onDisplaySettingsChanged: () => Promise<void>
}

export const DataFilterPanel: React.FC<Props> = ({
  modelKey,
  mainFields,
  displaySettings,
  onDisplaySettingsChanged,
  onPanelChanged,
  panelInfo,
}) => {
  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams<{ keywords: string; [p: string]: any }>()

  const displayFields = useMemo(
    () => FieldHelper.extractDisplayFields(mainFields, displaySettings),
    [mainFields, displaySettings]
  )

  const fieldMapper = useMemo(() => {
    return displayFields.reduce((result, cur) => {
      result[cur.filterKey] = cur
      return result
    }, {} as { [p: string]: ModelFieldModel })
  }, [displayFields])

  const [keywords, setKeywords] = useState('')
  useEffect(() => {
    setKeywords(queryParams.keywords || '')
  }, [queryParams.keywords])

  const filterItems = useMemo(() => {
    const items: FieldFilterItem[] = []
    const filterItemMapper = items.reduce((result, cur) => {
      result[cur.key] = cur
      return result
    }, {})
    const mergeFilterItem = (item: FieldFilterItem) => {
      if (filterItemMapper[item.key]) {
        filterItemMapper[item.key] = item
      } else {
        items.push(item)
      }
    }
    for (const key of Object.keys(queryParams)) {
      if (!queryParams[key]) {
        continue
      }
      if (fieldMapper[key]) {
        mergeFilterItem({
          key: key,
          filterKey: key,
          symbol: TextSymbol.$eq,
          field: fieldMapper[key],
          value: queryParams[key],
        })
        continue
      }
      const matches = key.match(/^([a-zA-Z_][\w.]+)\.(\$\w+)(\.\w+)?$/)
      if (!matches || !fieldMapper[matches[1]]) {
        continue
      }
      const filterKey = matches[1]
      const symbol = matches[2] as TextSymbol
      mergeFilterItem({
        key: key,
        filterKey: filterKey,
        symbol: symbol,
        field: fieldMapper[filterKey],
        value: queryParams[key],
      })
    }
    return items
  }, [queryParams, panelInfo, fieldMapper])

  const { data: panelList, loading } = useLoadingData(async () => {
    const request = MyRequest(new CommonAPI(ModelPanelApis.ModelPanelListGet, modelKey))
    return request.quickSend<ModelPanelInfo[]>()
  }, [modelKey])

  if (loading) {
    return <LoadingView />
  }

  return (
    <Space direction={'vertical'}>
      <h2 style={{ margin: '6px 0' }}>
        <Space>
          <span>控制面板</span>
          {panelInfo && (
            <Button
              size={'small'}
              type={'primary'}
              onClick={async () => {
                const dialog = new SimpleInputDialog({
                  title: '保存',
                  placeholder: '名称',
                  curValue: panelInfo.name,
                })
                dialog.show(async (name) => {
                  const params: ModelPanelParams = {
                    name: name,
                    configData: {
                      filterItems: filterItems.map((item) => ({
                        key: item.key,
                        filterKey: item.filterKey,
                        symbol: item.symbol,
                        value: item.value,
                      })),
                      displaySettings: displaySettings,
                    },
                  }
                  const request = MyRequest(
                    new CommonAPI(ModelPanelApis.ModelPanelUpdate, modelKey, panelInfo!.panelId)
                  )
                  request.setBodyData(params)
                  await request.quickSend<ModelPanelInfo>()
                  setQueryParams({
                    panelId: panelInfo!.panelId,
                  })
                  onPanelChanged()
                  message.info('面板保存成功')
                })
              }}
            >
              保存设置
            </Button>
          )}
          <Button
            size={'small'}
            onClick={() => {
              const dialog = new SimpleInputDialog({
                title: '另存为',
                placeholder: '名称',
                curValue: panelInfo ? panelInfo.name : '',
              })
              dialog.show(async (name) => {
                const params: ModelPanelParams = {
                  name: name,
                  configData: {
                    filterItems: filterItems.map((item) => ({
                      key: item.key,
                      filterKey: item.filterKey,
                      symbol: item.symbol,
                      value: item.value,
                    })),
                    displaySettings: displaySettings,
                  },
                }
                const request = MyRequest(new CommonAPI(ModelPanelApis.ModelPanelCreate, modelKey))
                request.setBodyData(params)
                const panel = await request.quickSend<ModelPanelInfo>()
                setQueryParams({
                  panelId: panel.panelId,
                })
                message.info('面板另存成功')
              })
            }}
          >
            另存设置
          </Button>
        </Space>
      </h2>

      <Space>
        {panelList.map((item) => {
          const checked = !!panelInfo && item.panelId === panelInfo.panelId
          return (
            <Tag key={item.panelId} color={checked ? 'red' : 'geekblue'}>
              {item.name} {checked && <CheckOutlined />}
            </Tag>
          )
        })}
      </Space>

      <h4 style={{ margin: '6px 0', fontSize: '110%' }}>
        筛选条件{' '}
        <a
          onClick={() => {
            const dialog = new FilterItemDialog({
              fieldItems: displayFields,
            })
            dialog.show((params) => {
              updateQueryParams({
                [params.key]: params.value,
              })
            })
          }}
        >
          <PlusSquareOutlined />
        </a>
      </h4>
      <Space wrap={true}>
        <Input.Search
          value={keywords}
          onChange={({ target: { value } }) => setKeywords(value)}
          placeholder='Keywords'
          onSearch={(keywords: string) => {
            updateQueryParams({
              keywords: keywords,
            })
          }}
          allowClear
          enterButton
        />

        <Button
          type={'primary'}
          onClick={() => {
            const dialog = new FieldsDisplaySettingDialog({
              mainFields: mainFields,
              displaySettings: displaySettings,
            })
            dialog.show(async (params) => {
              const request = MyRequest(
                new CommonAPI(CommonProfileApis.ProfileUserInfoUpdate, ProfileEvent.UserModelAppDisplay, modelKey)
              )
              request.setBodyData(params)
              await request.execute()
              message.success('调整成功')
              await onDisplaySettingsChanged()
            })
          }}
        >
          管理展示字段
        </Button>

        <Button
          onClick={() => {
            setQueryParams({})
            setKeywords('')
          }}
        >
          重置过滤器
        </Button>
      </Space>
      <TinyList>
        {keywords && (
          <li>
            keywords = {keywords}{' '}
            <a
              style={{ color: 'red' }}
              onClick={() => {
                updateQueryParams({
                  keywords: undefined,
                })
              }}
            >
              <DeleteOutlined />
            </a>
          </li>
        )}
        {filterItems.map((item) => (
          <DataFilterItemView
            key={item.key}
            filterItem={item}
            fields={displayFields}
            onFilterItemChanged={(options) => updateQueryParams(options)}
          />
        ))}
      </TinyList>
      {/*<ProForm autoFocusFirstInput={false} submitter={false} layout={'horizontal'}>*/}
      {/*  {fields*/}
      {/*    .filter((field) => [FieldType.Date, FieldType.Datetime].includes(field.fieldType as FieldType))*/}
      {/*    .map((field) => {*/}
      {/*      const key = `${field.filterKey}.${TextSymbol.$between}`*/}
      {/*      return (*/}
      {/*        <ProFormDateRangePicker*/}
      {/*          key={key}*/}
      {/*          name={key}*/}
      {/*          label={field.name}*/}
      {/*          placeholder={['开始时间', '结束时间']}*/}
      {/*          fieldProps={{*/}
      {/*            value:*/}
      {/*              Array.isArray(queryParams[key]) && queryParams[key].length === 2*/}
      {/*                ? queryParams[key].map((date: string) => dayjs(date))*/}
      {/*                : [null, null],*/}
      {/*            format: (value) => value.format('YYYY-MM-DD'),*/}
      {/*            onChange: (values) => {*/}
      {/*              const dateRange = values ? values.map((item: any) => item.format('YYYY-MM-DD')) : []*/}
      {/*              updateQueryParams({*/}
      {/*                [key]: dateRange,*/}
      {/*              })*/}
      {/*            },*/}
      {/*          }}*/}
      {/*        />*/}
      {/*      )*/}
      {/*    })}*/}
      {/*</ProForm>*/}
    </Space>
  )
}

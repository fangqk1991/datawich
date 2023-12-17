import React, { useEffect, useMemo, useState } from 'react'
import { FilterItemDialog } from './FilterItemDialog'
import { DeleteOutlined, PlusSquareOutlined } from '@ant-design/icons'
import { TextSymbol } from '@fangcha/logic'
import { TinyList } from './TinyList'
import {
  FieldFilterItem,
  FieldsDisplaySettings,
  ModelFieldModel,
  ModelPanelInfo,
  ModelPanelParams,
} from '@fangcha/datawich-service'
import { ConfirmDialog, LoadingView, SimpleInputDialog, useLoadingData, useQueryParams } from '@fangcha/react'
import { Button, Checkbox, Input, message, Space, Tag } from 'antd'
import { DataFilterItemView } from './DataFilterItemView'
import { FieldsDisplaySettingDialog } from './FieldsDisplaySettingDialog'
import { MyRequest, useVisitorCtx } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { CommonProfileApis, ModelPanelApis } from '@web/datawich-common/web-api'
import { FieldHelper, ProfileEvent } from '@web/datawich-common/models'

interface Props {
  panelInfo?: ModelPanelInfo | null
  modelKey: string
  mainFields: ModelFieldModel[]
  displaySettings: FieldsDisplaySettings
  onPanelChanged: () => Promise<void> | void
}

export const DataFilterPanel: React.FC<Props> = ({
  modelKey,
  mainFields,
  displaySettings,
  onPanelChanged,
  panelInfo,
}) => {
  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams<{ keywords: string; [p: string]: any }>()
  const [version, setVersion] = useState(0)
  const visitorCtx = useVisitorCtx()

  const displayFields = useMemo(
    () => FieldHelper.extractDisplayFields(mainFields, displaySettings),
    [mainFields, displaySettings]
  )

  const fieldMapper = useMemo(() => {
    return mainFields.reduce((result, cur) => {
      result[cur.filterKey] = cur
      return result
    }, {} as { [p: string]: ModelFieldModel })
  }, [mainFields])

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
  }, [modelKey, version])

  if (loading) {
    return <LoadingView />
  }

  return (
    <Space direction={'vertical'}>
      <h2 style={{ margin: '6px 0' }}>
        <Space>
          <span>控制面板</span>
          {panelInfo && visitorCtx.userInfo.email === panelInfo.author && (
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
                      queryParams: queryParams,
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
                  setVersion(version + 1)
                  message.success('面板保存成功')
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
                    queryParams: queryParams,
                    displaySettings: displaySettings,
                  },
                }
                const request = MyRequest(new CommonAPI(ModelPanelApis.ModelPanelCreate, modelKey))
                request.setBodyData(params)
                const panel = await request.quickSend<ModelPanelInfo>()
                setQueryParams({
                  panelId: panel.panelId,
                })
                setVersion(version + 1)
                message.success('面板另存成功')
              })
            }}
          >
            另存设置
          </Button>
          {panelInfo && (
            <Button
              size={'small'}
              danger={true}
              onClick={async () => {
                const request = MyRequest(
                  new CommonAPI(CommonProfileApis.ProfileUserInfoUpdate, ProfileEvent.UserModelDefaultPanel, modelKey)
                )
                request.setBodyData({
                  panelId: panelInfo!.panelId,
                })
                await request.quickSend()
                message.success('设置成功')
              }}
            >
              设为默认
            </Button>
          )}
        </Space>
      </h2>

      <Space>
        {panelList.map((item) => {
          const checked = !!panelInfo && item.panelId === panelInfo.panelId
          const isAuthor = visitorCtx.userInfo.email === item.author
          return (
            <Tag key={item.panelId} color={isAuthor ? 'success' : 'red'}>
              {item.name}{' '}
              <Checkbox
                checked={checked}
                onChange={(e) => setQueryParams({ panelId: e.target.checked ? item.panelId : undefined })}
              />{' '}
              {isAuthor && (
                <DeleteOutlined
                  style={{ color: 'red' }}
                  onClick={() => {
                    const dialog = new ConfirmDialog({
                      title: '删除面板',
                      content: `确定要删除面板 ${item.name} 吗`,
                    })
                    dialog.show(async () => {
                      const request = MyRequest(new CommonAPI(ModelPanelApis.ModelPanelDelete, modelKey, item.panelId))
                      await request.quickSend<ModelPanelInfo>()
                      if (checked) {
                        setQueryParams({})
                      }
                      setVersion(version + 1)
                      message.success('面板删除成功')
                    })
                  }}
                />
              )}
            </Tag>
          )
        })}
      </Space>

      <h4 style={{ margin: '6px 0', fontSize: '110%' }}>
        筛选条件{' '}
        <a
          onClick={() => {
            const dialog = new FilterItemDialog({
              displayFields: displayFields,
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
            dialog.show(async (newDisplaySettings) => {
              if (panelInfo) {
                const params: ModelPanelParams = {
                  name: panelInfo.name,
                  configData: {
                    queryParams: queryParams,
                    displaySettings: newDisplaySettings,
                  },
                }
                const request = MyRequest(new CommonAPI(ModelPanelApis.ModelPanelUpdate, modelKey, panelInfo.panelId))
                request.setBodyData(params)
                await request.quickSend<ModelPanelInfo>()
                setQueryParams({
                  panelId: panelInfo.panelId,
                })
                onPanelChanged()
                setVersion(version + 1)
                message.success('面板保存成功')
              } else {
                const dialog = new SimpleInputDialog({
                  title: '另存为',
                  placeholder: '面板名称',
                  curValue: '',
                })
                dialog.show(async (name) => {
                  const params: ModelPanelParams = {
                    name: name,
                    configData: {
                      queryParams: queryParams,
                      displaySettings: newDisplaySettings,
                    },
                  }
                  const request = MyRequest(new CommonAPI(ModelPanelApis.ModelPanelCreate, modelKey))
                  request.setBodyData(params)
                  const panel = await request.quickSend<ModelPanelInfo>()
                  setQueryParams({
                    panelId: panel.panelId,
                  })
                  setVersion(version + 1)
                  message.success('面板另存成功')
                })
              }
            })
          }}
        >
          管理展示字段
        </Button>

        <Button
          onClick={() => {
            setQueryParams({
              panelId: queryParams.panelId,
            })
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

import React, { useEffect, useMemo, useState } from 'react'
import { DeleteOutlined, PlusSquareOutlined } from '@ant-design/icons'
import { TextSymbol } from '@fangcha/logic'
import {
  FieldFilterItem,
  FieldHelper,
  ModelFieldModel,
  ModelPanelInfo,
  ModelPanelParams,
  ProfileEvent,
} from '@fangcha/datawich-service'
import { ConfirmDialog, LoadingView, SimpleInputDialog, useLoadingData, useQueryParams } from '@fangcha/react'
import { Button, Checkbox, Collapse, Input, message, Space, Tag } from 'antd'
import { MyRequest, useUserInfo } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { FilterItemDialog } from './FilterItemDialog'
import { FieldsDisplaySettingDialog } from '../data-display/FieldsDisplaySettingDialog'
import { DataFilterItemView } from './DataFilterItemView'
import { useModelPanel } from './ModelPanelContext'
import { DatawichWebSDKConfig } from '../DatawichWebSDKConfig'

interface Props {
  modelKey: string
  mainFields: ModelFieldModel[]
  controlPanelCollapse?: boolean
}

const trimQueryParams = (queryParams: {} = {}) => {
  return Object.keys(queryParams)
    .filter((key) => !!queryParams[key])
    .reduce((result, key) => {
      result[key] = queryParams[key]
      return result
    }, {})
}

export const DataFilterPanel: React.FC<Props> = ({ modelKey, mainFields, controlPanelCollapse }) => {
  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams<{ keywords: string; [p: string]: any }>()
  const [version, setVersion] = useState(0)
  const userInfo = useUserInfo()

  const panelCtx = useModelPanel()
  const { displaySettings, panelInfo, reloadPanelInfo } = panelCtx

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
      const matches = key.match(/^([a-zA-Z_][\w.]+)\.(\$not\.)?(\$\w+)(\.\w+)?$/)
      if (!matches || !fieldMapper[matches[1]]) {
        continue
      }
      const filterKey = matches[1]
      const isNot = matches[2] === '$not.'
      const symbol = matches[3] as TextSymbol
      const extension = matches[4]
      mergeFilterItem({
        isNot: isNot,
        disabled: extension === '.disabled',
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
    const request = MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.ModelPanelListGet, modelKey))
    return request.quickSend<ModelPanelInfo[]>()
  }, [modelKey, version])
  const [hideOthers, setHideOthers] = useState(false)
  const visiblePanels = useMemo(() => {
    if (!panelList) {
      return []
    }
    if (!hideOthers) {
      return panelList
    }
    return panelList.filter((panel) => panel.author === userInfo.email || panel.panelId === queryParams.panelId)
  }, [panelList, hideOthers, userInfo])

  if (loading) {
    return <LoadingView />
  }

  return (
    <Collapse
      ghost
      size={'small'}
      defaultActiveKey={!controlPanelCollapse ? 'ControlPanel' : undefined}
      items={[
        {
          key: 'ControlPanel',
          label: <b>控制面板</b>,
          children: (
            <Space direction={'vertical'}>
              {!!userInfo.email && (
                <Space>
                  {panelInfo && userInfo.email === panelInfo.author && (
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
                              queryParams: trimQueryParams(queryParams),
                              displaySettings: displaySettings,
                            },
                          }
                          const request = MyRequest(
                            new CommonAPI(DatawichWebSDKConfig.apis.ModelPanelUpdate, modelKey, panelInfo!.panelId)
                          )
                          request.setBodyData(params)
                          await request.quickSend<ModelPanelInfo>()
                          setQueryParams({
                            panelId: panelInfo!.panelId,
                          })
                          reloadPanelInfo()
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
                            queryParams: trimQueryParams(queryParams),
                            displaySettings: displaySettings,
                          },
                        }
                        const request = MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.ModelPanelCreate, modelKey))
                        request.setBodyData(params)
                        const panel = await request.quickSend<ModelPanelInfo>()
                        setQueryParams({
                          panelId: panel.panelId,
                        })
                        setVersion(version + 1)
                        message.success('面板另存 成功')
                      })
                    }}
                  >
                    另存设置
                  </Button>
                  <Button
                    size={'small'}
                    danger={true}
                    onClick={async () => {
                      const request = MyRequest(
                        new CommonAPI(
                          DatawichWebSDKConfig.apis.ProfileInfoUpdate,
                          ProfileEvent.UserModelDefaultPanel,
                          modelKey
                        )
                      )
                      request.setBodyData({
                        panelId: panelInfo ? panelInfo.panelId : '',
                      })
                      await request.quickSend()
                      message.success('设置成功')
                    }}
                  >
                    设为默认
                  </Button>
                </Space>
              )}
              <Checkbox checked={hideOthers} onChange={(e) => setHideOthers(e.target.checked)}>
                隐藏他人面板
              </Checkbox>
              <Space wrap={true}>
                {visiblePanels.map((item) => {
                  const checked = !!panelInfo && item.panelId === panelInfo.panelId
                  const isAuthor = userInfo.email === item.author
                  return (
                    <Tag key={item.panelId} color={isAuthor ? 'success' : 'red'}>
                      {item.name}{' '}
                      <Checkbox
                        checked={checked}
                        onChange={(e) => setQueryParams({ panelId: e.target.checked ? item.panelId : '' })}
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
                              const request = MyRequest(
                                new CommonAPI(DatawichWebSDKConfig.apis.ModelPanelDelete, modelKey, item.panelId)
                              )
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
                            queryParams: trimQueryParams(queryParams),
                            displaySettings: newDisplaySettings,
                          },
                        }
                        const request = MyRequest(
                          new CommonAPI(DatawichWebSDKConfig.apis.ModelPanelUpdate, modelKey, panelInfo.panelId)
                        )
                        request.setBodyData(params)
                        await request.quickSend<ModelPanelInfo>()
                        setQueryParams({
                          panelId: panelInfo.panelId,
                        })
                        reloadPanelInfo()
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
                              queryParams: trimQueryParams(queryParams),
                              displaySettings: newDisplaySettings,
                            },
                          }
                          const request = MyRequest(new CommonAPI(DatawichWebSDKConfig.apis.ModelPanelCreate, modelKey))
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
                    reloadPanelInfo()
                  }}
                >
                  重置过滤器
                </Button>
              </Space>
              <ul
                style={{
                  paddingInlineStart: '10px',
                  marginBlockStart: '4px',
                  marginBottom: 0,
                }}
              >
                {queryParams.keywords && (
                  <li>
                    keywords = {queryParams.keywords}{' '}
                    <a
                      style={{ color: 'red' }}
                      onClick={() => {
                        updateQueryParams({
                          keywords: '',
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
              </ul>
            </Space>
          ),
        },
      ]}
    />

    // <ProForm autoFocusFirstInput={false} submitter={false} layout={'horizontal'}>
    //   {fields
    //     .filter((field) => [FieldType.Date, FieldType.Datetime].includes(field.fieldType as FieldType))
    //     .map((field) => {
    //       const key = `${field.filterKey}.${TextSymbol.$between}`
    //       return (
    //         <ProFormDateRangePicker
    //           key={key}
    //           name={key}
    //           label={field.name}
    //           placeholder={['开始时间', '结束时间']}
    //           fieldProps={{
    //             value:
    //               Array.isArray(queryParams[key]) && queryParams[key].length === 2
    //                 ? queryParams[key].map((date: string) => dayjs(date))
    //                 : [null, null],
    //             format: (value) => value.format('YYYY-MM-DD'),
    //             onChange: (values) => {
    //               const dateRange = values ? values.map((item: any) => item.format('YYYY-MM-DD')) : []
    //               updateQueryParams({
    //                 [key]: dateRange,
    //               })
    //             },
    //           }}
    //         />
    //       )
    //     })}
    // </ProForm>
  )
}

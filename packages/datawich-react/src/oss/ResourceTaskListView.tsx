import React, { useReducer } from 'react'
import { Button, Divider, Space } from 'antd'
import { ColumnFilterType, TableView, TableViewColumn, useQueryParams } from '@fangcha/react'
import { DownloadApis, ResourceTaskModel, ResourceTaskStatus, ResourceTaskStatusDescriptor } from '@fangcha/oss-models'
import { FT, PageResult } from '@fangcha/tools'
import { MyRequest } from '@fangcha/auth-react'

const sizeFormat = (size: number) => {
  let unit
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  while ((unit = units.shift()) && size > 1024) {
    size = size / 1024
  }
  return `${unit === 'B' ? size : size.toFixed(2)}${unit}`
}

export const ResourceTaskListView: React.FC = () => {
  const [_, reloadData] = useReducer((x) => x + 1, 0)
  const { queryParams, updateQueryParams, setQueryParams } = useQueryParams<{
    taskStatus: string
  }>()

  return (
    <div>
      <h2>我的下载</h2>
      <Divider />
      <Space>
        <Button onClick={() => setQueryParams({})}>重置过滤器</Button>
      </Space>
      <Divider />
      <TableView
        reactiveQuery={true}
        rowKey={(item: ResourceTaskModel) => {
          return item.taskKey
        }}
        columns={TableViewColumn.makeColumns<ResourceTaskModel>([
          {
            key: 'createTime',
            sorter: true,
            title: '导出时间',
            render: (item) => FT(item.createTime),
          },
          {
            title: '文件名',
            render: (item) => item.fileName,
          },
          {
            key: 'size',
            sorter: true,
            title: '文件大小',
            render: (item) => sizeFormat(item.size),
          },
          {
            title: '状态',
            filterType: ColumnFilterType.Selector,
            options: ResourceTaskStatusDescriptor.options(),
            value: queryParams.taskStatus || '',
            onValueChanged: (newValue) => {
              updateQueryParams({
                taskStatus: newValue,
              })
            },
            render: (item) => item.taskStatus,
          },
          {
            title: '操作',
            render: (item) => (
              <>
                {(() => {
                  switch (item.taskStatus as ResourceTaskStatus) {
                    case ResourceTaskStatus.Pending:
                      break
                    case ResourceTaskStatus.Processing:
                      return '文件生成中'
                    case ResourceTaskStatus.Success:
                      return (
                        <a href={item.downloadUrl} target='_blank'>
                          下载
                        </a>
                      )
                    case ResourceTaskStatus.Fail:
                      return '生成失败'
                  }
                  return ''
                })()}
              </>
            ),
          },
        ])}
        defaultSettings={{
          pageSize: 10,
          sortKey: 'createTime',
          sortDirection: 'descending',
        }}
        loadData={async (retainParams) => {
          const request = MyRequest(DownloadApis.ResourceTaskPageDataGet)
          request.setQueryParams({
            ...retainParams,
            ...queryParams,
          })
          return request.quickSend<PageResult<ResourceTaskModel>>()
        }}
      />
    </div>
  )
}

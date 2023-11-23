import { Button, ConfigProvider, Empty, Space, Table } from 'antd'
import React, { useState } from 'react'
import { SelectOption } from '@fangcha/tools'
import { InputCell } from './InputCell'

interface Props {
  options?: SelectOption[]
  onOptionsChanged: (options: SelectOption[]) => void
}

export const TagsFieldExtension: React.FC<Props> = ({ options, onOptionsChanged }) => {
  const [items, setItems] = useState([...(options || [])])
  const setNewOptions = (newOptions: SelectOption[]) => {
    setItems(newOptions)
    onOptionsChanged(newOptions)
  }

  return (
    <ConfigProvider
      renderEmpty={() => (
        <Empty>
          <Button
            type='primary'
            onClick={() => {
              setNewOptions([
                ...items,
                {
                  label: '',
                  value: '',
                },
              ])
            }}
          >
            添加
          </Button>
        </Empty>
      )}
    >
      <Table
        rowKey={(item) => item.value}
        columns={[
          {
            title: '枚举值',
            render: (item: SelectOption, _, index) => {
              return (
                <InputCell
                  defaultValue={item.value}
                  onValueChanged={(value) => {
                    items[index].value = value
                    setNewOptions([...items])
                  }}
                />
              )
            },
          },
          {
            title: '枚举名称',
            render: (item: SelectOption, _, index) => {
              return (
                <InputCell
                  defaultValue={item.label}
                  onValueChanged={(value) => {
                    items[index].label = value
                    setNewOptions([...items])
                  }}
                />
              )
            },
          },
          {
            title: '操作',
            width: 100,
            render: (item: any, _, index) => (
              <Space>
                <Button
                  type={'link'}
                  onClick={() => {
                    setNewOptions([
                      ...items.slice(0, index + 1),
                      {
                        label: '',
                        value: '',
                      },
                      ...items.slice(index + 1),
                    ])
                  }}
                >
                  添加
                </Button>
                <Button
                  type={'link'}
                  onClick={() => {
                    setNewOptions([...items.slice(0, index), ...items.slice(index + 1)])
                  }}
                >
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
        dataSource={items}
        pagination={false}
      />
    </ConfigProvider>
  )
}

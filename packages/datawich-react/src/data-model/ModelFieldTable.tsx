import React, { useEffect, useMemo, useState } from 'react'
import { TableView } from '@fangcha/react'
import { CommonAPI } from '@fangcha/app-request'
import { ModelFieldApis } from '@web/datawich-common/web-api'
import { FieldTypeDescriptor, ModelFieldModel } from '@fangcha/datawich-service'
import { MyRequest } from '@fangcha/auth-react'
import { message, Switch, Tag } from 'antd'

interface Props {
  modelKey: string
}

export const ModelFieldTable: React.FC<Props> = ({ modelKey }) => {
  const [fields, setFields] = useState<ModelFieldModel[]>([])
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const request = MyRequest(new CommonAPI(ModelFieldApis.DataModelFieldListGet, modelKey))
    request.quickSend().then((response) => {
      setFields(response)
    })
  }, [modelKey, version])

  const fieldMap = useMemo(() => {
    return fields.reduce((result, cur) => {
      result[cur.fieldKey] = cur
      return result
    }, {})
  }, [fields])

  // this.rebuildIndexMaps()

  return (
    <div>
      <h3>字段管理</h3>
      <TableView
        version={version}
        rowKey={(item: ModelFieldModel) => {
          return `${item.fieldKey}`
        }}
        reactiveQuery={true}
        tableProps={{
          size: 'small',
          bordered: true,
        }}
        columns={[
          {
            title: '字段 Key',
            render: (item: ModelFieldModel) => (
              <>
                <span>{item.fieldKey}</span>
                {item.keyAlias && (
                  <>
                    <br />
                    <span>别名: {item.keyAlias}</span>
                  </>
                )}
              </>
            ),
          },
          {
            title: '字段名称',
            render: (item: ModelFieldModel) => <>{item.name}</>,
          },
          {
            title: '字段类型',
            render: (item: ModelFieldModel) => <>{FieldTypeDescriptor.describe(item.fieldType)}</>,
          },
          {
            title: '是否隐藏',
            render: (field: ModelFieldModel) => (
              <Switch
                checked={!!field.isHidden}
                onChange={(checked) => {
                  const request = MyRequest(
                    new CommonAPI(ModelFieldApis.DataModelFieldHiddenUpdate, field.modelKey, field.fieldKey)
                  )
                  request.setBodyData({ isHidden: checked ? 1 : 0 })
                  request.execute().then(() => {
                    message.success('修改成功')
                    setVersion(version + 1)
                  })
                }}
              />
            ),
          },

          {
            title: '是否必填',
            render: (field: ModelFieldModel) =>
              field.isSystem ? (
                <Tag>自动填</Tag>
              ) : (
                <Switch
                  checked={!!field.required}
                  onChange={(checked) => {
                    const request = MyRequest(
                      new CommonAPI(ModelFieldApis.DataModelFieldUpdate, field.modelKey, field.fieldKey)
                    )
                    request.setBodyData({ required: checked ? 1 : 0 })
                    request.execute().then(() => {
                      message.success('修改成功')
                      setVersion(version + 1)
                    })
                  }}
                />
              ),
          },
        ]}
        hidePagination={true}
        loadOnePageItems={async () => {
          return fields
        }}
      />
    </div>
  )
}

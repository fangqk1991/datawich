import React, { useEffect, useState } from 'react'
import { Card, Divider } from 'antd'
import { DatabaseApis } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'
import { DBTable } from '@fangcha/datawich-service'
import { LoadingView } from '@fangcha/react'
import { useParams } from 'react-router-dom'

export const DBTableDetailView: React.FC = () => {
  const { tableName = '' } = useParams()

  const [tableSchema, setTableSchema] = useState<DBTable>()

  useEffect(() => {
    const request = MyRequest(new CommonAPI(DatabaseApis.TableSchemaGet, tableName))
    request.quickSend().then((response) => setTableSchema(response))
  }, [])

  if (!tableSchema) {
    return <LoadingView />
  }

  return (
    <div>
      <h3>{tableSchema.tableName}</h3>
      <Divider />
      <Card>
        {tableSchema.fields.map((field) => (
          <Card.Grid
            style={{
              cursor: 'pointer',
              padding: '16px',
            }}
            key={field.fieldKey}
          >
            {field.fieldKey} - {field.fieldType}
          </Card.Grid>
        ))}
      </Card>
    </div>
  )
}

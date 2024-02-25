import React, { useEffect, useState } from 'react'
import { Card, Divider } from 'antd'
import { DatabaseApis } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'

export const DBTableListView: React.FC = () => {
  const [tableList, setTableList] = useState<string[]>([])

  useEffect(() => {
    const request = MyRequest(DatabaseApis.DBTableListGet)
    request.quickSend().then((response) => setTableList(response))
  }, [])

  return (
    <div>
      <h3>Databases</h3>
      <Divider />
      <Card>
        {tableList.map((tableName) => (
          <Card.Grid
            style={{
              cursor: 'pointer',
              padding: '16px',
            }}
            key={tableName}
          >
            {tableName}
          </Card.Grid>
        ))}
      </Card>
    </div>
  )
}

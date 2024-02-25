import React, { useEffect, useState } from 'react'
import { Card, Divider } from 'antd'
import { DatabaseApis, DatawichAdminPages } from '@web/datawich-common/admin-apis'
import { MyRequest } from '@fangcha/auth-react'
import { useNavigate } from 'react-router-dom'

export const DBTableListView: React.FC = () => {
  const [tableList, setTableList] = useState<string[]>([])
  const navigate = useNavigate()

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
            onClick={() => {
              navigate(DatawichAdminPages.buildRoute(DatawichAdminPages.DatabaseTableDetailRoute, [tableName]))
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

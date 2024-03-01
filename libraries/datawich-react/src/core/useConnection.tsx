import React, { useEffect, useState } from 'react'
import { DBConnection, SdkDatabaseApis } from '@fangcha/datawich-service'
import { useParams } from 'react-router-dom'
import { MyRequest } from '@fangcha/auth-react'
import { CommonAPI } from '@fangcha/app-request'

export const useConnection = () => {
  const { connectionId = '' } = useParams()
  const [connection, setConnection] = useState<DBConnection>()

  useEffect(() => {
    if (!connectionId) {
      setConnection({
        uid: '-',
        dbHost: '',
        dbPort: 3306,
        dbName: '',
        username: '',
        password: '',
      })
      return
    }
    MyRequest(new CommonAPI(SdkDatabaseApis.ConnectionInfoGet, connectionId))
      .quickSend()
      .then((response) => {
        setConnection(response)
      })
  }, [connectionId])

  return connection
}

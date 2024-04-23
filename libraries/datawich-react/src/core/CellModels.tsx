import React from 'react'

export interface DataRecord {
  _data_id: string
  [p: string]: any
}

export interface ExtrasColumn {
  title: React.ReactNode
  render: (item: DataRecord, _: DataRecord, index: number) => React.ReactNode
}

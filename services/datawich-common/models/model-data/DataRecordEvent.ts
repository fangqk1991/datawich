import { Descriptor } from '@fangcha/tools'

export enum DataRecordEvent {
  Create = 'Create',
  Delete = 'Delete',
  Update = 'Update',
}

const values = [DataRecordEvent.Create, DataRecordEvent.Delete, DataRecordEvent.Update]

const describe = (code: DataRecordEvent) => {
  switch (code) {
    case DataRecordEvent.Create:
      return '新增'
    case DataRecordEvent.Delete:
      return '删除'
    case DataRecordEvent.Update:
      return '更新'
  }
}

export const DataRecordEventDescriptor = new Descriptor(values, describe)

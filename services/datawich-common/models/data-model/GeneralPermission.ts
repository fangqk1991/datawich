import { Descriptor } from '@fangcha/tools'

export enum GeneralPermission {
  DoAnything = '*',
  ManageModel = 'P_ManageModel',
  P_HandleOthersData = 'P_HandleOthersData',
  AccessOthersData = 'P_AccessOthersData',
  AccessData = 'P_AccessData',
  ExportData = 'P_ExportData',
}

const values = [
  GeneralPermission.DoAnything,
  GeneralPermission.ManageModel,
  GeneralPermission.P_HandleOthersData,
  GeneralPermission.AccessOthersData,
  GeneralPermission.AccessData,
  GeneralPermission.ExportData,
]

const describe = (code: GeneralPermission) => {
  switch (code) {
    case GeneralPermission.DoAnything:
      return '*'
    case GeneralPermission.ManageModel:
      return '管理模型'
    case GeneralPermission.P_HandleOthersData:
      return '读写他人数据'
    case GeneralPermission.AccessOthersData:
      return '访问他人数据'
    case GeneralPermission.AccessData:
      return '读写自己数据'
    case GeneralPermission.ExportData:
      return '导出数据'
  }
  return 'Unknown'
}

export const GeneralPermissionDescriptor = new Descriptor(values, describe)

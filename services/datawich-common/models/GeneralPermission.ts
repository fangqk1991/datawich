import { Descriptor } from '@fangcha/tools'

export enum GeneralPermission {
  DoAnything = '*',
  ManageModel = 'P_ManageModel',
  AccessOthersData = 'P_AccessOthersData',
  AccessData = 'P_AccessData',
}

const values = [
  GeneralPermission.DoAnything,
  GeneralPermission.ManageModel,
  GeneralPermission.AccessOthersData,
  GeneralPermission.AccessData,
]

const describe = (code: GeneralPermission) => {
  switch (code) {
    case GeneralPermission.DoAnything:
      return '*'
    case GeneralPermission.ManageModel:
      return '管理模型'
    case GeneralPermission.AccessOthersData:
      return '访问他人数据'
    case GeneralPermission.AccessData:
      return '读写自己数据'
  }
  return 'Unknown'
}

export const GeneralPermissionDescriptor = new Descriptor(values, describe)

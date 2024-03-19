import { Descriptor } from '@fangcha/tools'

export enum OpenLevel {
  None = 'None', // （管理员外）不可访问
  Readonly = 'Readonly', // 管理员外的用户仅只读，管理员可修改
  Private = 'Private', // 仅可以访问/修改自己的数据
  Protected = 'Protected', // 可以访问所有数据，仅可修改自己的数据
  Public = 'Public', // 可以访问/修改所有数据
}

const values = [OpenLevel.None, OpenLevel.Readonly, OpenLevel.Private, OpenLevel.Protected, OpenLevel.Public]

const describe = (code: OpenLevel) => {
  return code
}

export const OpenLevelDescriptor = new Descriptor(values, describe)

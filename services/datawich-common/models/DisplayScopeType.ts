import { Descriptor } from '@fangcha/tools'

export enum DisplayScope {
  'LIST' = 'LIST',
  'DETAIL' = 'DETAIL',
}
const values = [DisplayScope.LIST, DisplayScope.DETAIL]

const describe = (code: DisplayScope) => {
  switch (code) {
    case DisplayScope.LIST:
      return '列表'
    case DisplayScope.DETAIL:
      return '详情'
  }
  return 'Unknown'
}

export const DisplayScopeDescriptor = new Descriptor(values, describe)

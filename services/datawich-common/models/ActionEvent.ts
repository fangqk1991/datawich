import { Descriptor } from '@fangcha/tools'

export enum ActionEvent {
  Link = 'Link',
  DerivativeInfo = 'DerivativeInfo',
}

const values = [ActionEvent.Link, ActionEvent.DerivativeInfo]

const describe = (code: ActionEvent) => {
  switch (code) {
    case ActionEvent.Link:
      return 'Link'
    case ActionEvent.DerivativeInfo:
      return '内容展示'
  }
}

export const ActionEventDescriptor = new Descriptor(values, describe)

import { Descriptor } from '@fangcha/tools'

export enum TriggerAction {
  Restrict = 'Restrict',
  Cascade = 'Cascade',
  SetNull = 'SetNull',
  NoAction = 'NoAction',
  SetDefault = 'SetDefault',
}

const values = [
  TriggerAction.Restrict,
  TriggerAction.Cascade,
  TriggerAction.SetNull,
  TriggerAction.NoAction,
  TriggerAction.SetDefault,
]

const describe = (code: TriggerAction) => {
  return code
}

export const describeSQLTriggerAction = (code: TriggerAction) => {
  switch (code) {
    case TriggerAction.Restrict:
      return 'RESTRICT'
    case TriggerAction.Cascade:
      return 'CASCADE'
    case TriggerAction.SetNull:
      return 'SET NULL'
    case TriggerAction.NoAction:
      return 'NO ACTION'
    case TriggerAction.SetDefault:
      return 'SET DEFAULT'
  }
}

export const TriggerActionDescriptor = new Descriptor(values, describe)

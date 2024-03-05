import { Descriptor } from '@fangcha/tools'

export enum FieldEnumType {
  None = 'None',
  Single = 'Single',
  Multiple = 'Multiple',
}

const values = [FieldEnumType.None, FieldEnumType.Single, FieldEnumType.Multiple]

const describe = (code: FieldEnumType) => {
  switch (code) {
    case FieldEnumType.None:
      return 'None'
    case FieldEnumType.Single:
      return '单选'
    case FieldEnumType.Multiple:
      return '多选'
  }
  return code
}

export const FieldEnumTypeDescriptor = new Descriptor(values, describe)

import { Descriptor } from '@fangcha/tools'

export enum FieldNumberType {
  Integer = 'Integer',
  Float = 'Float',
}

const values = [FieldNumberType.Integer, FieldNumberType.Float]

const describe = (code: FieldNumberType) => {
  switch (code) {
    case FieldNumberType.Integer:
      return '整数'
    case FieldNumberType.Float:
      return '浮点数'
  }
  return code
}

export const FieldNumberTypeDescriptor = new Descriptor(values, describe)

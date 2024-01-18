import { Descriptor } from '@fangcha/tools'

export enum OperationLevel {
  Readonly = 'Readonly',
  ValueWritable = 'ValueWritable',
  FullWritable = 'FullWritable',
}

const values = [OperationLevel.Readonly, OperationLevel.ValueWritable, OperationLevel.FullWritable]

const describe = (code: OperationLevel) => {
  return code
}

export const OperationLevelDescriptor = new Descriptor(values, describe)

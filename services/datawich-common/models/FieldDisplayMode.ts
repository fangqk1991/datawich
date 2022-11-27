import { Descriptor } from '@fangcha/tools'

export enum FieldDisplayMode {
  Collapse = 'Collapse',
  Open = 'Open',
}

const values = [FieldDisplayMode.Collapse, FieldDisplayMode.Open]

const describe = (code: FieldDisplayMode) => {
  return code
}

export const FieldDisplayModeDescriptor = new Descriptor(values, describe)

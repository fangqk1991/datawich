import { Descriptor } from '@fangcha/tools'

export enum WidgetType {
  Default = 'Default',
  Input = 'Input',
  Radio = 'Radio',
  Select = 'Select',
  List = 'List',
}

const values = [WidgetType.Default, WidgetType.Input, WidgetType.Radio, WidgetType.Select, WidgetType.List]

const describe = (code: WidgetType) => {
  return code
}

export const WidgetTypeDescriptor = new Descriptor(values, describe)

import { Descriptor } from '@fangcha/tools'

export enum FieldObjectType {
  JSON = 'JSON',
  StringList = 'StringList',
  Attachment = 'Attachment',
}

const values = [FieldObjectType.JSON, FieldObjectType.StringList, FieldObjectType.Attachment]

const describe = (code: FieldObjectType) => {
  switch (code) {
    case FieldObjectType.JSON:
      break
    case FieldObjectType.StringList:
      break
    case FieldObjectType.Attachment:
      break
  }
  return code
}

export const FieldObjectTypeDescriptor = new Descriptor(values, describe)

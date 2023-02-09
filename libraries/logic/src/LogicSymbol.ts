import { Descriptor } from '@fangcha/tools'

export enum LogicSymbol {
  AND = 'AND',
  OR = 'OR',
}

const values = [LogicSymbol.AND, LogicSymbol.OR]

const describe = (code: LogicSymbol) => {
  return code
}

export const LogicSymbolDescriptor = new Descriptor(values, describe)

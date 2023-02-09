import { FilterSymbol } from './FilterSymbol'
import { LogicSymbol } from './LogicSymbol'

export interface FilterCondition {
  leftKey: string
  symbol: FilterSymbol
  rightValue: number | string | (string | number)[]
}

export interface LogicExpression {
  logic?: LogicSymbol
  elements?: LogicExpression[]
  condition?: FilterCondition
  logicResult?: boolean
}

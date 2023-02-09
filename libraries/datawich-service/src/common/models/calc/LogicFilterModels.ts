import { FilterSymbol, LogicSymbol } from './index'

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

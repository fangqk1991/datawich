import assert from '@fangcha/assert'
import { LogicSymbol, LogicSymbolDescriptor } from './LogicSymbol'
import { LogicExpression } from './LogicFilterModels'
import { FilterSymbol, FilterSymbolDescriptor } from './FilterSymbol'

export class LogicExpressionHelper {
  public static expressionExample(): LogicExpression {
    return {
      logic: LogicSymbol.OR,
      elements: [],
    }
  }

  public static checkExpressionValid(expression: LogicExpression) {
    const handler = (meta: LogicExpression) => {
      assert.ok(
        meta.logicResult !== undefined ||
          LogicSymbolDescriptor.checkValueValid(meta.logic) ||
          meta.condition !== undefined,
        'logic / condition 至少需要被定义一个'
      )
      if (meta.logicResult !== undefined) {
        assert.ok(meta.logicResult === true || meta.logicResult === false, 'logicResult 必须为 bool 值')
        return
      }
      if (meta.condition) {
        assert.ok(!!meta.condition.leftKey, 'condition.leftKey 定义有误')
        assert.ok(FilterSymbolDescriptor.checkValueValid(meta.condition.symbol), 'condition.symbol 定义有误')
        if (meta.condition.symbol === FilterSymbol.IN) {
          assert.ok(Array.isArray(meta.condition.rightValue), 'rightValue 必须为 array 类型')
        }
      }
      if (LogicSymbolDescriptor.checkValueValid(meta.logic)) {
        const children = meta.elements!
        assert.ok(Array.isArray(children), 'elements 定义有误')
        children.forEach((item) => {
          handler(item)
        })
      }
    }
    handler(expression)
  }

  public static calcExpression(expression: LogicExpression, data: {}) {
    this.checkExpressionValid(expression)

    const handler = (meta: LogicExpression) => {
      if (meta.logicResult !== undefined) {
        return !!meta.logicResult
      }
      if (LogicSymbolDescriptor.checkValueValid(meta.logic)) {
        const children = meta.elements!
        if (children.length > 0) {
          if (meta.logic === LogicSymbol.AND) {
            for (const item of children) {
              if (!handler(item)) {
                return false
              }
            }
            return true
          } else if (meta.logic === LogicSymbol.OR) {
            for (const item of children) {
              if (handler(item)) {
                return true
              }
            }
            return false
          }
        }
      } else if (meta.condition) {
        const inputVal = data[meta.condition.leftKey]
        const expectVal = meta.condition.rightValue
        switch (meta.condition.symbol) {
          case FilterSymbol.IN:
            return (expectVal as string[]).includes(inputVal)
          case FilterSymbol.NotIN:
            return !(expectVal as string[]).includes(inputVal)
          case FilterSymbol.BoolEQ:
            return !!inputVal === !!expectVal
          case FilterSymbol.LIKE:
            return new RegExp(expectVal as string).test(inputVal)
          case FilterSymbol.EQ:
            return inputVal === expectVal
          case FilterSymbol.NE:
            return inputVal !== expectVal
          case FilterSymbol.GE:
            return inputVal >= expectVal
          case FilterSymbol.LE:
            return inputVal <= expectVal
          case FilterSymbol.GT:
            return inputVal > expectVal
          case FilterSymbol.LT:
            return inputVal < expectVal
        }
      }
      return true
    }
    return handler(expression)
  }
}

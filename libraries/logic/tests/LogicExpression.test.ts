import { FilterSymbol, LogicExpression, LogicExpressionHelper, LogicSymbol } from '../src'

describe('Test LogicExpression.test.ts', () => {
  it(`Test LogicExpression`, async () => {
    const expression: LogicExpression = {
      logic: LogicSymbol.OR,
      elements: [
        {
          condition: {
            leftKey: 'a',
            symbol: FilterSymbol.LIKE,
            rightValue: '^2$',
          },
        },
        {
          logic: LogicSymbol.AND,
          elements: [
            {
              condition: {
                leftKey: 'b',
                symbol: FilterSymbol.GE,
                rightValue: 10,
              },
            },
            {
              condition: {
                leftKey: 'b',
                symbol: FilterSymbol.LE,
                rightValue: 20,
              },
            },
          ],
        },
      ],
    }
    console.info(
      LogicExpressionHelper.calcExpression(expression, {
        a: 2,
        b: 30,
      })
    )
  })

  it(`Test logicResult`, async () => {
    const expression: LogicExpression = {
      logicResult: false,
    }
    console.info(LogicExpressionHelper.calcExpression(expression, {}))
  })
})

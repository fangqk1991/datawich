import { FieldFilterParams } from './ModelPanelModels'
import { TextSymbol } from '@fangcha/logic'

export class ModelPanelTools {
  public static calculateFilterItemKey(options: FieldFilterParams) {
    let key = options.filterKey
    if (options.symbol !== TextSymbol.$eq || options.isNot || options.disabled) {
      key = `${options.filterKey}.${options.symbol}`
    }
    if (options.isNot) {
      key = `${options.filterKey}.\$not.${options.symbol}`
    }
    if (options.disabled) {
      key = `${key}.disabled`
    }
    return key
  }
}

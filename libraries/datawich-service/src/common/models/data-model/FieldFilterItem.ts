import { TextSymbol } from '@fangcha/logic'
import { ModelFieldModel } from '../field/ModelFieldModel'

export interface FieldFilterParams {
  key: string
  filterKey: string
  symbol: TextSymbol
  value: string | string[]
}

export interface FieldFilterItem extends FieldFilterParams {
  key: string
  filterKey: string
  symbol: TextSymbol
  field: ModelFieldModel
  value: string | string[]
}

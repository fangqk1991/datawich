import { ModelFieldModel } from '@fangcha/datawich-service'
import { TextSymbol } from '@fangcha/logic'

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

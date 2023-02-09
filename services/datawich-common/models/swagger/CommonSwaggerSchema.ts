import { SwaggerSchema } from '@fangcha/swagger'
import { FilterSymbol, FilterSymbolDescriptor } from '@fangcha/datawich-service'

export const CommonSwaggerSchema = {
  FilterSymbol: {
    type: 'enum',
    enum: FilterSymbolDescriptor.values,
    description: '符号',
    example: FilterSymbol.EQ,
  } as SwaggerSchema,
}

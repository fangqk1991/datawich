import { DescribableField, FieldLinkMaker, FieldLinkModel, FieldMaker, FieldType, ModelFieldModel } from './field'
import { Raw_FieldLink, Raw_ModelField } from './auto-build'
import { ModelFullMetadata } from './ModelFullMetadata'
import {
  extractCheckedMapForValue,
  extractMultiEnumCheckedMapForValue,
  getCheckedTagsForField,
} from './GeneralDataHelper'

export class GeneralDataFormatter {
  public static formatModelField(rawData: Raw_ModelField) {
    return new FieldMaker(rawData).getFieldModel()
  }

  public static makeDescribableFields(modelFields: Raw_ModelField[], links: FieldLinkModel[] = []): DescribableField[] {
    modelFields = modelFields.filter((item) => !item.isHidden)
    return modelFields.reduce((prev, cur) => {
      const maker = new FieldMaker(cur)
      maker.setLinks(links)
      return prev.concat(maker.getDescribableFields())
    }, [] as DescribableField[])
  }

  public static makeDescribableFieldsFromMetadata(metadata: ModelFullMetadata) {
    const fieldLinks = metadata.fieldLinks.map((rawData) => new FieldLinkMaker(rawData).getLinkModel())
    return GeneralDataFormatter.makeDescribableFields(metadata.modelFields, fieldLinks)
  }

  public static formatFieldLink(rawData: Raw_FieldLink) {
    return new FieldLinkMaker(rawData).getLinkModel()
  }

  public static transferValueNaturalLanguage(value: any, field: ModelFieldModel) {
    if (field.fieldType === FieldType.Enum || field.fieldType === FieldType.TextEnum) {
      const value2LabelMap = field.value2LabelMap
      if (Object.keys(value2LabelMap).length > 0) {
        return value2LabelMap[value]
      }
    } else if (field.fieldType === FieldType.Tags) {
      const checkedMap = extractCheckedMapForValue(value, field)
      return getCheckedTagsForField(field, checkedMap).join(', ')
    } else if (field.fieldType === FieldType.MultiEnum) {
      const checkedMap = extractMultiEnumCheckedMapForValue(value, field.options)
      return getCheckedTagsForField(field, checkedMap).join(', ')
    }
    return value
  }
}

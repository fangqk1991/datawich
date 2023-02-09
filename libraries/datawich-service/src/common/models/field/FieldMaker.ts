import { DateRange, DescribableField, ModelFieldExtrasData, ModelFieldModel } from './ModelFieldModel'
import { checkFieldHasOptions, FieldType } from './FieldType'
import { FieldLinkModel } from './FieldLinkModel'
import { LinkMapperInfo } from './LinkMapperInfo'
import { I18nCode } from '@fangcha/tools'
import { _TinyDatawich } from '../../_TinyDatawich'
import { Keys_Raw_ModelField, Raw_ModelField } from './ModelFieldTypes'
import { GeneralDataHelper } from '../../tools'

export class FieldMaker {
  public readonly rawField: Raw_ModelField
  private _fieldModel!: ModelFieldModel
  private _describableFields!: DescribableField[]
  private _links: FieldLinkModel[] = []

  constructor(rawField: Raw_ModelField) {
    this.rawField = rawField
  }

  public setLinks(links: FieldLinkModel[]) {
    this._links = links.filter((item) => item.fieldKey === this.rawField.fieldKey)
  }

  public getDescribableFields(): DescribableField[] {
    if (!this._describableFields) {
      const fieldModel = this.getFieldModel()
      const fieldInfo: DescribableField = {
        fieldKey: fieldModel.fieldKey,
        dataKey: GeneralDataHelper.calculateDataKey(fieldModel),
        fieldType: fieldModel.fieldType,
        name: fieldModel.name,
      }
      if ([FieldType.Enum, FieldType.TextEnum, FieldType.MultiEnum, FieldType.Tags].includes(fieldModel.fieldType)) {
        fieldInfo.options = fieldModel.options
        fieldInfo.value2LabelMap = fieldModel.value2LabelMap
      }
      if (fieldModel.keyAlias) {
        fieldInfo.keyAlias = fieldModel.keyAlias
      }
      const fieldInfos: DescribableField[] = [fieldInfo]

      for (const link of this._links) {
        const refFields = link.referenceFields
        const referenceCheckedInfos = link.referenceCheckedInfos
        const checkedMap: { [p: string]: LinkMapperInfo } = {}
        for (const info of referenceCheckedInfos) {
          if (info.checked) {
            checkedMap[info.fieldKey] = info
          }
        }
        for (const refField of refFields) {
          const name =
            checkedMap[refField.fieldKey]?.mappingName || GeneralDataHelper.inlineFieldDefaultName(refField, fieldInfo)
          fieldInfos.push({
            fieldKey: refField.fieldKey,
            dataKey: GeneralDataHelper.calculateDataKey(refField, fieldInfo),
            fieldType: refField.fieldType as FieldType,
            name: `${name} [${fieldInfo.name} 关联]`,
            options: refField.options,
            value2LabelMap: refField.value2LabelMap,
          })
        }
      }
      for (const plugin of _TinyDatawich.plugins) {
        if (plugin.onFieldInfosMade) {
          plugin.onFieldInfosMade(this.rawField, fieldInfos)
        }
      }
      this._describableFields = fieldInfos
    }
    return this._describableFields
  }

  public getFieldModel(): ModelFieldModel {
    if (!this._fieldModel) {
      const rawData: any = {}
      Keys_Raw_ModelField.forEach((key) => {
        rawData[key] = this.rawField[key]
      })
      const extrasData = (() => {
        let data: { [p: string]: any } = {}
        try {
          data = JSON.parse(rawData.extrasInfo) || {}
        } catch (e) {}
        return data
      })() as ModelFieldExtrasData
      const options = (() => {
        if (checkFieldHasOptions(rawData.fieldType)) {
          const options = extrasData['options'] || []
          options.forEach((option: any) => {
            option['restraintValueMap'] = option['restraintValueMap'] || {}
          })
          return options
        }
        return []
      })()
      const result = { ...rawData } as ModelFieldModel
      result.extrasData = extrasData
      result.options = options
      result.value2LabelMap = options.reduce((result: any, cur: any) => {
        result[cur.value] = cur.label
        return result
      }, {})
      result.dateRange = (() => {
        const dateRange = {
          floor: '',
          ceil: '',
        }
        if (rawData.fieldType === FieldType.Date || rawData.fieldType === FieldType.Datetime) {
          const dateRange1: Partial<DateRange> = extrasData.dateRange || {}
          if (dateRange1.floor) {
            dateRange.floor = dateRange1.floor
          }
          if (dateRange1.ceil) {
            dateRange.ceil = dateRange1.ceil
          }
        }
        return dateRange
      })()
      result.searchable = rawData.fieldType === FieldType.SingleLineText && extrasData.searchable ? 1 : 0
      result.useEnumSelector = extrasData.useEnumSelector || false
      result.referenceCheckedInfos = extrasData.referenceCheckedInfos || []
      result.referenceInline = extrasData.referenceInline || 0
      result.constraintKey = extrasData.constraintKey
      result.keyAlias = extrasData.keyAlias
      result.actions = extrasData.actions || []
      result.nameI18n = extrasData.nameI18n || {
        [I18nCode.en]: rawData.name,
        [I18nCode.zhHans]: rawData.name,
      }
      result.filterKey = GeneralDataHelper.calculateFilterKey(result)
      result.dataKey = GeneralDataHelper.calculateDataKey(result)
      // @ts-ignore
      delete result.extrasInfo
      this._fieldModel = result
    }
    return this._fieldModel
  }
}

import __ModelField from '../auto-build/__ModelField'
import assert from '@fangcha/assert'
import { Transaction } from 'fc-sql'
import { _DataModel } from './_DataModel'
import { _FieldLink } from './_FieldLink'
import { _FieldEnumMetadata } from './_FieldEnumMetadata'
import {
  checkFieldHasOptions,
  FieldActionParams,
  FieldHelper,
  FieldType,
  FieldTypeDescriptor,
  GeneralDataFormatter,
  ModelFieldModel,
  Raw_ModelField,
} from '@fangcha/datawich-service'
import { ActionEventDescriptor } from '@web/datawich-common/models'

export class _ModelField extends __ModelField implements Raw_ModelField {
  public constructor() {
    super()
  }

  public static async findModelField<T extends _ModelField>(
    this: { new (): T },
    modelKey: string,
    fieldKey: string,
    transaction?: Transaction
  ) {
    const params = {
      model_key: modelKey,
      field_key: fieldKey,
    }
    return (await (this as any).findOne(params, transaction)) as T
  }

  public static checkValidParams(params: ModelFieldModel, onlyCheckDefinedKeys = false) {
    if (!onlyCheckDefinedKeys || params.fieldKey !== undefined) {
      assert.ok(/^[a-z_][a-z0-9_]{1,62}$/.test(params.fieldKey), '字段 Key 需满足规则 /^[a-z_][a-z0-9_]{1,62}$/')
    }
    if (!onlyCheckDefinedKeys || params.name !== undefined) {
      assert.ok(!!params.name, '字段名称不能为空')
    }
    if (!onlyCheckDefinedKeys || params.fieldType !== undefined) {
      assert.ok(FieldTypeDescriptor.checkValueValid(params.fieldType), '字段类型有误')
    }
    if (params.required !== undefined) {
      assert.ok([0, 1].includes(params.required), 'required 参数有误')
    }
    if (params.useDefault !== undefined) {
      assert.ok([0, 1].includes(params.useDefault), 'useDefault 参数有误')
    }
    if (params.star !== undefined) {
      assert.ok([0, 1].includes(params.star), 'star 参数有误')
    }
    if (params.fieldType === FieldType.TextEnum) {
      assert.ok(Array.isArray(params.options), '枚举项有误')
      assert.ok(params.options.length > 0, '至少要有 1 个枚举项')
      params.options.forEach((option) => {
        assert.ok(!!option.value && typeof option.value === 'string', '枚举值必须为字符串')
        assert.ok(!!option.label, '枚举名称不能为空')
      })
      if (params.constraintKey) {
        params.options.forEach((option) => {
          assert.ok(!!option['restraintValueMap'], 'option.restraintValueMap 有误')
        })
      }
      if (params.extrasData && params.extrasData.useEnumSelector !== undefined) {
        assert.ok([true, false].includes(params.extrasData.useEnumSelector), 'useEnumSelector 参数有误')
      }
    } else if (params.fieldType === FieldType.MultiEnum) {
      assert.ok(Array.isArray(params.options), '标签项有误')
      assert.ok(params.options.length > 0, '至少要有 1 个枚举项')
      params.options.forEach((option) => {
        assert.ok(!!option.value && /^\w{1,15}$/.test(`${option.value}`), '字段 Key 需满足规则 /^\\w{1,15}$/')
        assert.ok(!!option.label, '枚举名称不能为空')
      })
    } else if (params.fieldType === FieldType.Date || params.fieldType === FieldType.Datetime) {
      if (params.extrasData.dateRange) {
        ;['floor', 'ceil'].forEach((key) => {
          const date = params.extrasData.dateRange[key]
          assert.ok(date === '' || /^[+-]\d+d$/.test(date) || /^\d{4}-\d{2}-\d{2}$/.test(date), `${key} 时间格式有误`)
        })
      }
    }
  }

  public extrasData() {
    let data: { [p: string]: any } = {}
    try {
      data = JSON.parse(this.extrasInfo) || {}
    } catch (e) {}
    return data
  }

  public options() {
    if (checkFieldHasOptions(this.fieldType)) {
      const data = this.extrasData()
      const options = data['options'] || []
      options.forEach((option: any) => {
        option['restraintValueMap'] = option['restraintValueMap'] || {}
      })
      return options
    }
    return []
  }
  public value2LabelMap() {
    if (checkFieldHasOptions(this.fieldType as FieldType)) {
      const options = this.options()
      return options.reduce((result: any, cur: any) => {
        result[cur.value] = cur.label
        return result
      }, {})
    }
    return {}
  }

  public label2ValueMap() {
    if (checkFieldHasOptions(this.fieldType)) {
      const options = this.options()
      return options.reduce((result: any, cur: any) => {
        result[cur.label] = cur.value
        return result
      }, {})
    }
    return {}
  }

  public dateRange() {
    const dateRange = {
      floor: '',
      ceil: '',
    }
    if (this.fieldType === FieldType.Date || this.fieldType === FieldType.Datetime) {
      const data = this.extrasData()
      const dateRange1 = data['dateRange'] || {}
      if (dateRange1.floor) {
        dateRange.floor = dateRange1.floor
      }
      if (dateRange1.ceil) {
        dateRange.ceil = dateRange1.ceil
      }
    }
    return dateRange
  }

  public getHint() {
    switch (this.fieldType as FieldType) {
      case FieldType.TextEnum: {
        const texts: string[] = []
        texts.push(`枚举项(单选)`)
        texts.push(...this.options().map((item: any) => item.label))
        return texts.join('\n')
      }
      case FieldType.MultiEnum: {
        const texts: string[] = []
        texts.push(`枚举项(多选)`)
        texts.push(...this.options().map((item: any) => item.label))
        return texts.join('\n')
      }
      case FieldType.Date:
        return 'yyyy-MM-dd'
      case FieldType.Datetime:
        return 'ISO 8601 时间'
    }
    return ''
  }

  public getExample() {
    switch (this.fieldType as FieldType) {
      case FieldType.TextEnum: {
        const options = this.options() as any[]
        if (options.length > 0) {
          return options[0].label
        }
        break
      }
      case FieldType.Integer:
      case FieldType.Float:
      case FieldType.Date:
        return '2000-01-01'
      case FieldType.Datetime:
        return '2020-01-01T00:00:00+08:00'
    }
    return 'Some Text'
  }

  public async updateFeed(params: any, extras: any, transaction?: Transaction) {
    this.fc_edit()
    if (params.name !== undefined) {
      this.name = params.name
    }
    if (params.inputHint !== undefined) {
      this.inputHint = params.inputHint
    }
    if (params.required !== undefined) {
      this.required = params.required
    }
    if (params.useDefault !== undefined) {
      this.useDefault = params.useDefault
    }
    if (params.defaultValue !== undefined) {
      this.defaultValue = params.defaultValue
    }
    if (params.isHidden !== undefined) {
      this.isHidden = params.isHidden
    }
    if (params.groupKey !== undefined) {
      this.groupKey = params.groupKey
    }
    if (params.star !== undefined) {
      this.star = params.star
    }
    if (params.forBroadcast !== undefined) {
      this.forBroadcast = params.forBroadcast
    }
    this.extrasInfo = JSON.stringify(Object.assign(this.extrasData(), extras))
    return this.updateToDB(transaction)
  }

  public sqlTableName() {
    const model = new _DataModel()
    model.modelKey = this.modelKey
    return model.sqlTableName()
  }

  public modelForClient() {
    return GeneralDataFormatter.formatModelField(this)
  }

  public async getFieldLinks() {
    const searcher = new _FieldLink().fc_searcher()
    searcher.processor().addConditionKV('field_key', this.fieldKey)
    searcher.processor().addConditionKV('model_key', this.modelKey)
    return searcher.queryAllFeeds()
  }

  public async rebuildEnumOptions(transaction?: Transaction) {
    if (this.fieldType === FieldType.TextEnum || this.fieldType === FieldType.MultiEnum) {
      const database = this.dbSpec().database
      await database.update(
        `DELETE FROM field_enum_metadata WHERE model_key = ? AND field_key = ?`,
        [this.modelKey, this.fieldKey],
        transaction
      )
      const options = this.options()
      for (const option of options) {
        const metadata = new _FieldEnumMetadata()
        metadata.modelKey = this.modelKey
        metadata.fieldKey = this.fieldKey
        metadata.valueType = 'STRING'
        metadata.value = option.value
        metadata.label = option.label
        await metadata.strongAddToDB(transaction)
      }
    }
  }

  public async addColumnToDB() {
    const columnSpec = FieldHelper.getFieldTypeDatabaseSpec(this as any)
    const tableHandler = this.dbSpec().database.tableHandler(this.sqlTableName())
    await tableHandler.addColumn(this.fieldKey, columnSpec)
  }

  public async changeColumnToDB() {
    const columnSpec = FieldHelper.getFieldTypeDatabaseSpec(this as any)
    const tableHandler = this.dbSpec().database.tableHandler(this.sqlTableName())
    await tableHandler.changeColumn(this.fieldKey, columnSpec)
  }

  public async updateActions(actions: FieldActionParams[]) {
    actions.forEach((params) => {
      assert.ok(ActionEventDescriptor.checkValueValid(params.event), '动作类型有误')
      assert.ok(!!params.title, '动作描述不能为空')
      assert.ok(!!params.content, '动作内容不能为空')
    })
    await this.updateFeed({}, { actions: actions })
  }

  public async checkHasReferences() {
    const searcher = new _FieldLink().fc_searcher()
    searcher.processor().addConditionKV('ref_model', this.modelKey)
    searcher.processor().addConditionKV('ref_field', this.fieldKey)
    return (await searcher.queryCount()) > 0
  }

  public static async fieldsForModelKey<T extends _ModelField>(this: { new (): T }, modelKey: string) {
    const searcher = new this().fc_searcher()
    searcher.processor().addConditionKV('model_key', modelKey)
    searcher.processor().addOrderRule('weight', 'DESC')
    searcher.processor().addOrderRule('_rid', 'ASC')
    return searcher.queryAllFeeds()
  }
}

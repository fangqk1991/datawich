import __FieldLink from '../auto-build/__FieldLink'
import { _DataModel } from './_DataModel'
import assert from '@fangcha/assert'
import { Transaction } from 'fc-sql'
import { logger } from '@fangcha/logger'
import { makeUUID } from '@fangcha/tools'
import { FieldLinkModel, LinkMapperInfo, Raw_FieldLink } from '@fangcha/datawich-service/lib/common/models'
import { _ModelField } from './_ModelField'
import { _FieldIndex } from './_FieldIndex'
import { describeSQLTriggerAction, TriggerAction } from '@web/datawich-common/models'
import { GeneralDataFormatter, GeneralDataHelper } from '@fangcha/datawich-service/lib/common/tools'

export class _FieldLink extends __FieldLink implements Raw_FieldLink {
  public constructor() {
    super()
  }

  public foreignKeyConstraintName() {
    return `fk_${this.modelKey}__${this.fieldKey}`
  }

  public sqlTableName() {
    const model = new _DataModel()
    model.modelKey = this.modelKey
    return model.sqlTableName()
  }

  public refTableName() {
    const model = new _DataModel()
    model.modelKey = this.refModel
    return model.sqlTableName()
  }

  public referenceKey() {
    return `${this.refModel}.${this.refField}`
  }

  public referenceCheckedInfos(): LinkMapperInfo[] {
    const data = this.extrasData()
    return data['referenceCheckedInfos'] || []
  }

  public referenceCheckedMap() {
    const referenceCheckedInfos = this.referenceCheckedInfos()
    const checkedMap: { [p: string]: LinkMapperInfo } = {}
    for (const info of referenceCheckedInfos) {
      if (info.checked) {
        checkedMap[info.fieldKey] = info
      }
    }
    return checkedMap
  }

  public extrasData() {
    let data = {}
    try {
      data = JSON.parse(this.extrasInfo) || {}
    } catch (e) {}
    return data
  }

  public async getRefFields() {
    const refModel = new _DataModel()
    refModel.modelKey = this.refModel
    const checkedMap = this.referenceCheckedMap()
    const fields = await refModel.getVisibleFields()
    return fields.filter((field) => !!checkedMap[field.fieldKey])
  }

  public static async checkValidParams(params: FieldLinkModel, onlyCheckDefinedKeys = false) {
    const { modelKey, fieldKey, refModel, refField, isInline, referenceCheckedInfos } = params
    if (!onlyCheckDefinedKeys) {
      assert.ok(!!modelKey, 'modelKey ???????????????')
      assert.ok(!!fieldKey, 'fieldKey ???????????????')
      assert.ok(!!refModel, 'refModel ???????????????')
      assert.ok(!!refField, 'refField ???????????????')
      assert.ok(!!(await _ModelField.findModelField(modelKey, fieldKey)), 'mainField ?????????')
      assert.ok(!!(await _ModelField.findModelField(refModel, refField)), 'refField ?????????')
      const fieldIndex = await _FieldIndex.findIndex(refModel, refField)
      assert.ok(!!(fieldIndex && fieldIndex.isUnique), '?????????????????????????????????????????????')
    }
    if (!onlyCheckDefinedKeys || isInline !== undefined) {
      assert.ok([0, 1].includes(isInline), 'isInline ???????????????')
    }
    if (!onlyCheckDefinedKeys || referenceCheckedInfos) {
      assert.ok(!!Array.isArray(referenceCheckedInfos), '???????????????????????????referenceCheckedInfos ????????? Array')
      referenceCheckedInfos.forEach((linkInfo) => {
        assert.ok(!!linkInfo.fieldKey, `???????????????????????????fieldKey ?????????`)
        assert.ok(linkInfo.mappingName !== undefined, `???????????????????????????mappingName ?????????`)
        assert.ok(linkInfo.checked !== undefined, `???????????????????????????checked ?????????`)
      })
    }
  }

  public static async createLink(fieldLinkModel: FieldLinkModel) {
    await _FieldLink.checkValidParams(fieldLinkModel, false)

    const fieldLink = new _FieldLink()
    fieldLink.linkId = makeUUID()
    fieldLink.modelKey = fieldLinkModel.modelKey
    fieldLink.fieldKey = fieldLinkModel.fieldKey
    fieldLink.refModel = fieldLinkModel.refModel
    fieldLink.refField = fieldLinkModel.refField
    fieldLink.isInline = fieldLinkModel.isInline
    fieldLink.onUpdateAction = TriggerAction.Cascade
    fieldLink.onDeleteAction = TriggerAction.Restrict
    fieldLink.fkName = fieldLink.foreignKeyConstraintName()
    fieldLink.extrasInfo = JSON.stringify({
      referenceCheckedInfos: fieldLinkModel.referenceCheckedInfos || [],
    })
    assert.ok(!(await fieldLink.checkExists()), '????????????????????????????????????')
    await fieldLink.addToDB()
    return fieldLink
  }

  public async checkExists() {
    const searcher = this.fc_searcher()
    searcher.processor().addConditionKV('model_key', this.modelKey)
    searcher.processor().addConditionKV('field_key', this.fieldKey)
    searcher.processor().addConditionKV('ref_model', this.refModel)
    searcher.processor().addConditionKV('ref_field', this.refField)
    return (await searcher.queryCount()) > 0
  }

  public static async findLink(linkId: string, transaction?: Transaction) {
    return (await this.findWithUid(linkId, transaction))!
  }

  public async updateLinkInfo(params: FieldLinkModel) {
    await _FieldLink.checkValidParams(params, true)
    const { isInline, isForeignKey, referenceCheckedInfos } = params
    if (isForeignKey !== undefined) {
      assert.ok([0, 1].includes(isForeignKey), 'isForeignKey ???????????????')
      if (isForeignKey === 1 && this.isForeignKey === 0) {
        assert.ok(
          !(await this.checkForeignKeyConstraintExists()),
          `${this.fieldKey} ??????????????????????????????????????????????????????????????????`
        )
        const fieldIndex = await _FieldIndex.findIndex(this.modelKey, this.fieldKey)
        assert.ok(!!fieldIndex, `${this.fieldKey} ??????????????????????????????????????????`)
      }
    }
    this.fc_edit()
    if (isInline !== undefined) {
      this.isInline = isInline
    }
    if (isForeignKey !== undefined) {
      this.isForeignKey = isForeignKey
    }
    if (referenceCheckedInfos) {
      const extrasData = {
        referenceCheckedInfos: referenceCheckedInfos,
      }
      this.extrasInfo = JSON.stringify(extrasData)
    }

    const runner = this.dbSpec().database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      const changedMap = await this.updateToDB(transaction)
      if ('is_foreign_key' in changedMap) {
        if (this.isForeignKey) {
          await this.createForeignKeyConstraint()
        } else {
          await this.dropForeignKeyConstraint()
        }
      }
    })
  }

  public modelForClient() {
    return GeneralDataFormatter.formatFieldLink(this)
  }

  public async getReferenceModel(transaction?: Transaction) {
    return _DataModel.findModel(this.refModel, transaction)
  }

  public async getReferenceField(transaction?: Transaction) {
    return _ModelField.findModelField(this.refModel, this.refField, transaction)
  }

  public async getMainField(transaction?: Transaction) {
    return _ModelField.findModelField(this.modelKey, this.fieldKey, transaction)
  }

  public async modelWithRefFields() {
    const data = this.modelForClient()
    const refModel = await this.getReferenceModel()
    const mainField = await this.getMainField()
    const checkedMap = this.referenceCheckedMap()
    const uniqueMap = await refModel.getUniqueColumnMap()
    const fields = await refModel.getVisibleFields()
    data.referenceFields = fields
      .filter((field) => !!checkedMap[field.fieldKey])
      .map((field) => {
        const data = field.modelForClient()
        const linkInfo = checkedMap[field.fieldKey]
        if (linkInfo.mappingName) {
          data.name = linkInfo.mappingName
        } else {
          data.name = GeneralDataHelper.inlineFieldDefaultName(mainField, field)
        }
        data.filterKey = GeneralDataHelper.calculateFilterKey(field, this)
        data.dataKey = GeneralDataHelper.calculateDataKey(field, this)
        data.isUnique = uniqueMap[field.fieldKey] ? 1 : 0
        return data
      })
    return data
  }

  public async checkForeignKeyConstraintExists() {
    const searcher = new _FieldLink().fc_searcher()
    searcher.processor().addConditionKV('model_key', this.modelKey)
    searcher.processor().addConditionKV('field_key', this.fieldKey)
    searcher.processor().addConditionKV('is_foreign_key', 1)
    return (await searcher.queryCount()) > 0
  }

  private async createForeignKeyConstraint() {
    try {
      const database = this.dbSpec().database
      const constraintName = this.foreignKeyConstraintName()

      const curFieldKey = this.fieldKey
      const tableName = this.sqlTableName()
      const refTableName = this.refTableName()
      const refFieldKey = this.refField
      const onUpdateDesc = describeSQLTriggerAction(this.onUpdateAction as TriggerAction)
      const onDeleteDesc = describeSQLTriggerAction(this.onDeleteAction as TriggerAction)
      const sql = `ALTER TABLE ${tableName} ADD CONSTRAINT \`${constraintName}\` FOREIGN KEY (\`${curFieldKey}\`) REFERENCES \`${refTableName}\`(\`${refFieldKey}\`) ON UPDATE ${onUpdateDesc} ON DELETE ${onDeleteDesc}`
      await database.update(sql)
    } catch (e) {
      if ((e as any).original?.errno === 1061) {
        // ???????????????
      } else {
        throw e
      }
    }
  }

  private async dropForeignKeyConstraint() {
    try {
      const database = this.dbSpec().database
      const constraintName = this.foreignKeyConstraintName()
      await database.update(`ALTER TABLE ${this.sqlTableName()} DROP FOREIGN KEY \`${constraintName}\``)
      await database.update(`ALTER TABLE ${this.sqlTableName()} DROP INDEX \`${constraintName}\``)
    } catch (e) {
      logger.error(e)
    }
  }

  public async dropLink() {
    const runner = this.dbSpec().database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      await this.deleteFromDB(transaction)
      await this.dropForeignKeyConstraint()
    })
  }
}

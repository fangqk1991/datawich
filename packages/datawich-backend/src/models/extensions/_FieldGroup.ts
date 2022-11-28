import __FieldGroup from '../auto-build/__FieldGroup'
import assert from '@fangcha/assert'
import { Transaction } from 'fc-sql'
import { _ModelField } from './_ModelField'
import { FieldGroupModel } from '@fangcha/datawich-service/lib/common/models'

export class _FieldGroup extends __FieldGroup {
  public constructor() {
    super()
  }

  public static async checkValidParams(params: FieldGroupModel, onlyCheckDefinedKeys = false) {
    const { modelKey, groupKey, name, displayTmpl } = params
    if (!onlyCheckDefinedKeys || groupKey !== undefined) {
      assert.ok(/^[a-z_][a-z0-9_]{1,62}$/.test(groupKey), 'groupKey 需满足规则 /^[a-z_][a-z0-9_]{1,62}$/')
    }
    if (!onlyCheckDefinedKeys) {
      assert.ok(!!modelKey, 'modelKey 参数不合法')
      assert.ok(!!name, 'name 参数不合法')
      assert.ok(!!displayTmpl, 'displayTmpl 参数不合法')
    }
  }

  public static async createGroup<T extends _FieldGroup>(this: { new (): T }, params: FieldGroupModel) {
    const clazz = this as any as typeof _FieldGroup
    await clazz.checkValidParams(params, false)

    const fieldGroup = new this()
    fieldGroup.modelKey = params.modelKey
    fieldGroup.groupKey = params.groupKey
    fieldGroup.name = params.name
    fieldGroup.displayTmpl = params.displayTmpl
    assert.ok(!(await fieldGroup.checkExistsInDB()), '字段组已存在，不可重复创建')
    await fieldGroup.addToDB()
    return fieldGroup
  }

  public static async findGroup<T extends _FieldGroup>(
    this: { new (): T },
    modelKey: string,
    groupKey: string,
    transaction?: Transaction
  ) {
    const clazz = this as any as typeof _FieldGroup
    return (await clazz.findOne(
      {
        model_key: modelKey,
        group_key: groupKey,
      },
      transaction
    )) as T
  }

  public async updateInfos(params: FieldGroupModel) {
    const clazz = this.constructor as any as typeof _FieldGroup
    await clazz.checkValidParams(params, true)
    this.fc_edit()
    this.fc_generateWithModel(params)
    await this.updateToDB()
  }

  public async destroyGroup() {
    const fields = await this.getGroupFields()
    const runner = this.dbSpec().database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      await this.deleteFromDB(transaction)
      for (const field of fields) {
        field.fc_edit()
        field.groupKey = ''
        await field.updateToDB(transaction)
      }
    })
  }

  private async getGroupFields() {
    const searcher = new _ModelField().fc_searcher()
    searcher.processor().addConditionKV('model_key', this.modelKey)
    searcher.processor().addConditionKV('group_key', this.groupKey)
    return searcher.queryAllFeeds()
  }
}

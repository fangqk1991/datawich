import assert from '@fangcha/assert'
import { makeUUID } from '@fangcha/tools'
import { _DataModel } from '../models/extensions/_DataModel'
import {
  ModelFieldModel,
  ModelFullMetadata,
  ModelPanelParams,
  Raw_FieldLink,
  Raw_ModelField,
} from '@fangcha/datawich-service'
import { _ModelField } from '../models/extensions/_ModelField'
import { _ModelMilestone } from '../models/extensions/_ModelMilestone'
import { ModelDataHandler } from './ModelDataHandler'
import { _ModelGroup } from '../models/permission/_ModelGroup'
import { _DatawichService } from './_DatawichService'
import { _ModelPanel } from '../models/extensions/_ModelPanel'

export class DataModelHandler {
  private readonly _dataModel: _DataModel

  public constructor(dataModel: _DataModel) {
    this._dataModel = dataModel
  }

  public async getFullMetadata(): Promise<ModelFullMetadata> {
    const dataModel = this._dataModel
    const fields = await _ModelField.fieldsForModelKey(dataModel.modelKey)
    const links = await dataModel.getFieldLinks()
    const indexes = await dataModel.getColumnIndexes()
    return {
      systemVersion: _DatawichService.version,
      modelKey: dataModel.modelKey,
      tagName: 'master',
      description: '当前版本',
      dataModel: dataModel.modelForClient(),
      modelFields: fields.map((item) => item.fc_pureModel() as Raw_ModelField),
      fieldLinks: links.map((item) => item.fc_pureModel() as Raw_FieldLink),
      fieldIndexes: indexes.map((item) => item.fc_pureModel() as ModelFieldModel),
      fieldGroups: [],
    }
  }

  public async importMilestone(metadata: ModelFullMetadata) {
    const dataModel = this._dataModel
    const tagName = metadata.tagName || ''
    assert.ok(/^[\w-.]{1,63}$/.test(tagName), 'tagName 需满足规则 /^[\\w-.]{1,63}$/')
    assert.ok(tagName !== 'master', 'master 为保留字，不可使用')
    assert.ok(!(await _ModelMilestone.checkMilestoneExists(dataModel.modelKey, tagName)), `tagName ${tagName} 已存在`)

    metadata.modelKey = dataModel.modelKey
    metadata.dataModel.modelKey = dataModel.modelKey
    metadata.modelFields.forEach((item) => {
      item.modelKey = dataModel.modelKey
    })
    metadata.fieldLinks.forEach((item) => {
      item.modelKey = dataModel.modelKey
    })
    metadata.fieldIndexes.forEach((item) => {
      item.modelKey = dataModel.modelKey
    })
    metadata.fieldGroups.forEach((item) => {
      item.modelKey = dataModel.modelKey
    })

    const feed = new _ModelMilestone()
    feed.uid = makeUUID()
    feed.modelKey = dataModel.modelKey
    feed.tagName = tagName
    feed.description = metadata.description || ''
    feed.metadataStr = JSON.stringify(metadata)
    await feed.addToDB()
    return feed
  }

  public async createMilestone(params: { tagName: string; description?: string }) {
    const dataModel = this._dataModel
    const { tagName, description } = params
    assert.ok(/^[\w-.]{1,63}$/.test(tagName), 'tagName 需满足规则 /^[\\w-.]{1,63}$/')
    assert.ok(tagName !== 'master', 'master 为保留字，不可使用')
    assert.ok(!(await _ModelMilestone.checkMilestoneExists(dataModel.modelKey, tagName)), `tagName ${tagName} 已存在`)
    const feed = new _ModelMilestone()
    feed.uid = makeUUID()
    feed.modelKey = dataModel.modelKey
    feed.tagName = tagName
    feed.description = description || ''
    const metadata = await this.getFullMetadata()
    metadata.tagName = feed.tagName
    metadata.description = feed.description
    feed.metadataStr = JSON.stringify(metadata)
    await feed.addToDB()
    return feed
  }

  public async cloneToModel(toModelKey: string, operator: string) {
    const clazz = this.constructor as any as typeof _DataModel
    const feed = await clazz.findWithUid(toModelKey)
    assert.ok(!feed, `模型 Key[${toModelKey}] 已存在`)

    const metadata = await this.getFullMetadata()
    metadata.modelKey = toModelKey
    return _DataModel.generateFullModel(metadata, operator)
  }

  private async assertDeleteAble() {
    const dataModel = this._dataModel
    assert.ok(!dataModel.isRetained, '该模型是系统预留模型，不可删除')
    {
      const searcher = await new ModelDataHandler(dataModel).dataSearcherWithoutFields()
      assert.ok((await searcher.queryCount()) === 0, '该模型已有数据存在，不可删除')
    }
  }

  /**
   * @description Dangerous!!!
   */
  public async destroyModel() {
    const dataModel = this._dataModel
    await this.assertDeleteAble()

    const fields = await dataModel.getFields()
    for (const field of fields) {
      await dataModel.deleteField(field)
    }

    const groupLinks = await _ModelGroup.itemsForModelKey(dataModel.modelKey)
    const groups = await dataModel.getRetainGroups()
    const database = dataModel.dbSpec().database
    const runner = database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      for (const link of groupLinks) {
        await link.deleteFromDB(transaction)
      }
      for (const group of groups) {
        await group.destroyGroup(transaction)
      }
      await dataModel.deleteFromDB(transaction)
    })

    const tableHandler = database.tableHandler(dataModel.sqlTableName())
    await tableHandler.dropFromDatabase()
  }

  public getMilestoneSearcher() {
    const searcher = new _ModelMilestone().fc_searcher()
    searcher.processor().setColumns(['uid', 'model_key', 'tag_name', 'description', 'create_time'])
    searcher.processor().addConditionKV('model_key', this._dataModel.modelKey)
    searcher.processor().addOrderRule('_rid', 'DESC')
    return searcher
  }

  public getPanelSearcher() {
    const searcher = new _ModelPanel().fc_searcher()
    searcher.processor().addConditionKV('model_key', this._dataModel.modelKey)
    searcher.processor().addOrderRule('_rid', 'DESC')
    return searcher
  }

  public async createPanel(params: ModelPanelParams) {
    const dataModel = this._dataModel

    assert.ok(!!params.name, '名称不能为空')
    assert.ok(!!params.configData, 'configData 不能为空')
    assert.ok(!!params.configData.displaySettings, 'configData.displaySettings 有误')
    params.configData.queryParams = params.configData.queryParams || {}

    const feed = new _ModelPanel()
    feed.panelId = makeUUID()
    feed.modelKey = dataModel.modelKey
    feed.author = params.author || ''
    feed.name = params.name
    feed.configDataStr = JSON.stringify(params.configData)
    await feed.addToDB()
    return feed
  }
}

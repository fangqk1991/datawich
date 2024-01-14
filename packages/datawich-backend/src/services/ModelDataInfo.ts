import { FCDatabase, Transaction } from 'fc-sql'
import assert from '@fangcha/assert'
import { ModelDataHandler } from './ModelDataHandler'
import { _DataModel } from '../models/extensions/_DataModel'
import { FieldType, GeneralDataHelper } from '@fangcha/datawich-service'

export class ModelDataInfo {
  public static database: FCDatabase

  public dataId: string
  public readonly dataModel: _DataModel
  private _rawData?: {}

  public constructor(dataModel: _DataModel, dataId: string) {
    this.dataModel = dataModel
    this.dataId = dataId
  }

  public static async findWithRid(dataModel: _DataModel, rid: number) {
    const searcher = await new ModelDataHandler(dataModel).dataSearcherWithFilter({
      [`${dataModel.modelKey}.rid`]: rid,
    })
    searcher.setLimitInfo(0, 1)
    const [data] = await new ModelDataHandler(dataModel).queryItems(searcher)
    if (data) {
      const info = new this(dataModel, data['_data_id'])
      info._rawData = data
      return info
    }
    return undefined
  }

  public static async findDataInfo(dataModel: _DataModel, dataId: string) {
    const info = new this(dataModel, dataId)
    const data = await info.getRawData()
    if (data) {
      return info
    }
    return undefined
  }

  public async assertExists() {
    const data = await this.getRawData()
    assert.ok(!!data, `数据[${this.dataId}]不存在`, 404)
  }

  public async getRawData() {
    if (!this._rawData) {
      const dataModel = await this.dataModel
      const searcher = await new ModelDataHandler(dataModel).dataSearcherWithFilter({
        dataId: this.dataId,
      })
      searcher.setLimitInfo(0, 1)
      const [data] = await new ModelDataHandler(dataModel).queryItems(searcher)
      this._rawData = data
    }
    return this._rawData!
  }

  public async readableData() {
    const dataHandler = new ModelDataHandler(this.dataModel)
    const rawData = await this.getRawData()
    const [data] = await dataHandler.transferItemsValueNaturalLanguage([rawData])
    return data
  }

  public async deleteFromDB(transaction?: Transaction) {
    const tableName = this.dataModel.sqlTableName()
    const database = ModelDataInfo.database

    const handler = async (transaction: Transaction) => {
      const remover = database.remover()
      remover.transaction = transaction
      remover.setTable(tableName)
      remover.addConditionKV('_data_id', this.dataId)
      await remover.execute()
    }
    if (transaction) {
      await handler(transaction)
    } else {
      const runner = database.createTransactionRunner()
      await runner.commit(handler)
    }
  }

  public async getUserEmailList(): Promise<string[]> {
    const data = await this.readableData()
    delete data.author
    delete data.update_author
    const dataModel = this.dataModel
    const fields = await dataModel.getFields()
    const userEmailList = new Set()
    for (const mainField of fields) {
      const links = await mainField.getFieldLinks()
      const dataKey = GeneralDataHelper.calculateDataKey(mainField)
      if (mainField.fieldType === FieldType.User) {
        if (data[dataKey]) {
          userEmailList.add(data[dataKey])
        }
      }
      for (const link of links) {
        const model = await link.modelWithRefFields()
        const refFields = model.referenceFields
        for (const refField of refFields) {
          const dataKey = GeneralDataHelper.calculateDataKey(refField, mainField)
          if (refField.fieldType === FieldType.User) {
            if (data[dataKey]) {
              userEmailList.add(data[dataKey])
            }
          }
        }
      }
    }
    return [...userEmailList] as string[]
  }
}

import { FilterOptions } from 'fc-feed'
import { SearchBuilder } from '@fangcha/tools/lib/database'
import { SQLSearcher } from 'fc-sql'
import * as fs from 'fs'
import { CsvMaker, makeUUID, PageResult, SelectOption } from '@fangcha/tools'
import { logger } from '@fangcha/logger'
import { OssFileInfo } from '@fangcha/oss-models'
import assert from '@fangcha/assert'
import { _DataModel } from '../models/extensions/_DataModel'
import {
  DescribableField,
  FieldLinkModel,
  FieldType,
  GeneralDataChecker,
  GeneralDataFormatter,
  GeneralDataHelper,
  ModelFieldModel,
} from '@fangcha/datawich-service'
import { _ModelField } from '../models/extensions/_ModelField'
import { ModelDataInfo } from './ModelDataInfo'
import { WideSearcherBuilder } from './WideSearcherBuilder'
import { _FieldLink } from '../models/extensions/_FieldLink'
import { _DatawichService } from './_DatawichService'
import { FieldHelper } from '@web/datawich-common/models'
import { TypicalExcel } from '@fangcha/excel'
const archiver = require('archiver')

export class ModelDataHandler {
  private readonly _dataModel: _DataModel
  private _operator: string = ''

  public constructor(dataModel: _DataModel) {
    this._dataModel = dataModel
  }

  public setOperator(operator: string) {
    this._operator = operator
    return this
  }

  public async dataSearcherWithFilter(options: FilterOptions = {}) {
    const fields = await this._dataModel.getFields()
    const fieldLinks = await this._dataModel.getFieldLinks()
    return this._dataSearcher(options, fields, fieldLinks)
  }

  public async dataSearcher() {
    return this._dataSearcher()
  }

  /**
   * @description 具有 constraintData 及需要支持字段筛选时，需传入 fields
   */
  private async _dataSearcher(options: FilterOptions = {}, fields: _ModelField[] = [], fieldLinks: _FieldLink[] = []) {
    options = { ...options }
    const dataModel = this._dataModel

    const builder = new WideSearcherBuilder(this._dataModel)
    builder.setMainFields(fields, fieldLinks)
    builder.setFilterOptions(options)
    const searcher = await builder.build()
    searcher.addOrderRule(`${dataModel.sqlTableName()}.rid`, 'DESC')
    return searcher
  }

  public async dataSummaryInfo(options: FilterOptions = {}) {
    const sumSearcher = await this.dataSearcherWithFilter(options)
    sumSearcher.removeAllOrderRules()

    const dataModel = this._dataModel
    const tableName = dataModel.sqlTableName()
    const fields = await dataModel.getFields()
    const calculableFields = fields.filter((field) => FieldHelper.checkCalculableField(field.fieldType as FieldType))
    if (calculableFields.length > 0) {
      const columns = calculableFields.map((field) => {
        return `IFNULL(SUM(${tableName}.${field.fieldKey}), 0) AS \`${field.fieldKey}\``
      })
      sumSearcher.setColumns(columns)
      return sumSearcher.querySingle()
    }
  }

  public async getDataCount(options: FilterOptions = {}) {
    const searcher = await this.dataSearcherWithFilter(options)
    return searcher.queryCount()
  }

  public async convertData(data: any) {
    const convertData = (fieldType: string, dataKey: string) => {
      switch (fieldType) {
        case FieldType.StringList: {
          if (data[dataKey]) {
            try {
              if (data[dataKey]) {
                data[dataKey] = JSON.parse(data[dataKey])
              }
            } catch (e) {
              console.error(e)
            }
          }
          break
        }
        case FieldType.MultiEnum: {
          data[GeneralDataHelper.entityKey(dataKey)] = GeneralDataHelper.extractMultiEnumItems(data[dataKey])
          break
        }
        case FieldType.Attachment: {
          let entity = null
          try {
            if (data[dataKey]) {
              entity = JSON.parse(data[dataKey]) as OssFileInfo
              entity.url = _DatawichService.ossForSignature!.signatureURL(entity.ossKey)
            }
          } catch (e) {
            console.error(e)
          }
          data[GeneralDataHelper.entityKey(dataKey)] = entity
          break
        }
      }
    }
    const dataModel = this._dataModel
    const modelFields = await dataModel.getFields()
    const keyPrefix = dataModel.shortKey || dataModel.modelKey
    data._data_key = `${keyPrefix}-${data.rid}`
    for (const plugin of _DatawichService.plugins) {
      if (plugin.onDataFound) {
        await plugin.onDataFound(data, dataModel)
      }
    }

    modelFields
      .filter((field) =>
        [FieldType.StringList, FieldType.Attachment, FieldType.MultiEnum].includes(field.fieldType as FieldType)
      )
      .forEach((field) => {
        convertData(field.fieldType, field.fieldKey)
      })
    const fieldLinks = await dataModel.getFieldLinks()
    for (const link of fieldLinks) {
      const refFields = await link.getRefFields()
      refFields
        .filter((field) =>
          [FieldType.StringList, FieldType.Attachment, FieldType.MultiEnum].includes(field.fieldType as FieldType)
        )
        .forEach((refField) => {
          convertData(refField.fieldType, GeneralDataHelper.calculateDataKey(refField, link))
        })
    }
    return data
  }

  public async queryItems(searcher: SQLSearcher) {
    const items = (await searcher.queryList()) as any[]
    for (const item of items) {
      await this.convertData(item)
    }
    return items
  }

  /**
   * @deprecated
   */
  public async deprecated_getListData(options: FilterOptions = {}) {
    const searcher = await this.dataSearcherWithFilter(options)
    options._offset = Math.max(options._offset || 0, 0)
    options._length = Math.max(Math.min(options._length || 100, 10000), 0)
    searcher.setLimitInfo(options._offset, options._length)
    const items = await this.queryItems(searcher)
    return {
      elements: items,
      totalSize: await searcher.queryCount(),
    }
  }

  public async getPageResult(options: FilterOptions = {}): Promise<PageResult> {
    const searcher = await this.dataSearcherWithFilter(options)
    options._offset = Math.max(options._offset || 0, 0)
    options._length = Math.max(Math.min(options._length || 100, 10000), 0)
    searcher.setLimitInfo(options._offset, options._length)
    const items = await this.queryItems(searcher)
    return {
      offset: options._offset,
      length: items.length,
      totalCount: await searcher.queryCount(),
      items: items,
    } as PageResult
  }

  public async checkDataAccessible(email: string, dataId: string) {
    const options = {
      dataId: dataId,
      lockedUser: email,
      relatedUser: email,
    }
    const searcher = await this.dataSearcherWithFilter(options)
    return (await searcher.queryCount()) > 0
  }

  public async searchInfosWithUniqueField(field: _ModelField, keywords: string) {
    keywords = `${keywords}`.trim()
    const dataModel = this._dataModel
    const tableName = dataModel.sqlTableName()
    const columnName = `${tableName}.\`${field.fieldKey}\``
    const searcher = dataModel.dbSpec().database.searcher()
    searcher.setTable(tableName)
    searcher.markDistinct()
    searcher.setColumns([columnName])
    if (keywords.length > 0) {
      const keywordsLike = `%${keywords}%`
      const builder = new SearchBuilder()
      builder.useSorting()
      builder.addCondition(`${columnName} = ?`, keywords)
      builder.addCondition(`${columnName} LIKE ?`, keywordsLike)
      builder.injectToSearcher(searcher)
    }
    searcher.setLimitInfo(0, 10)
    const items = (await searcher.queryList()) as any[]
    const keyIdList = items.map((item) => item[field.fieldKey])
    let optionsList: SelectOption[] = keyIdList.map((item) => {
      return {
        label: item,
        value: item,
      }
    })
    const { dataInfoTmpl = '' } = dataModel.getExtrasData()
    if (dataInfoTmpl) {
      const searcher = dataModel.dbSpec().database.searcher()
      searcher.setTable(tableName)
      searcher.setColumns(['*'])
      searcher.addConditionKeyInArray(field.fieldKey, keyIdList)
      const items = await searcher.queryList()
      optionsList = items.map((item) => {
        return {
          value: item[field.fieldKey],
          label: dataInfoTmpl.replace(/\{\{\.(.*?)\}\}/g, (_: any, dataKey: string) => {
            return item[dataKey]
          }),
        }
      })
    }
    return optionsList
  }

  public async searchDistinctInfos(field: _ModelField, keywords: string) {
    keywords = `${keywords}`.trim()
    const dataModel = this._dataModel
    const tableName = dataModel.sqlTableName()
    const columnName = `${tableName}.\`${field.fieldKey}\``
    const searcher = dataModel.dbSpec().database.searcher()
    searcher.setTable(tableName)
    searcher.markDistinct()
    searcher.setColumns([columnName])
    if (keywords.length > 0) {
      const keywordsLike = `%${keywords}%`
      const builder = new SearchBuilder()
      builder.useSorting()
      builder.addCondition(`${columnName} = ?`, keywords)
      builder.addCondition(`${columnName} LIKE ?`, keywordsLike)
      builder.injectToSearcher(searcher)
    }
    searcher.setLimitInfo(0, 10)
    searcher.addOrderRule(columnName, 'ASC')
    const items = (await searcher.queryList()) as any[]
    const keyIdList = items.map((item) => item[field.fieldKey])
    const optionsList: SelectOption[] = keyIdList.map((item) => {
      return {
        label: item,
        value: item,
      }
    })
    return optionsList
  }

  public async makeDescriptionFields(withOuterFields = false) {
    const model = this._dataModel
    const modelFields = await model.getVisibleFields()
    const allLinks: FieldLinkModel[] = []
    if (withOuterFields) {
      const links = await model.getFieldLinks()
      for (const link of links) {
        allLinks.push(await link.modelWithRefFields())
      }
    }
    return GeneralDataFormatter.makeDescribableFields(modelFields, allLinks)
  }

  private _transferItemsValueNaturalLanguage(items: any[], field: ModelFieldModel, dataKey: string) {
    if (field.fieldType === FieldType.Enum || field.fieldType === FieldType.TextEnum) {
      const value2LabelMap = field.value2LabelMap
      if (Object.keys(value2LabelMap).length > 0) {
        items.forEach((item) => {
          if (item[dataKey] in value2LabelMap) {
            item[dataKey] = value2LabelMap[item[dataKey]]
          }
        })
      }
    } else if (field.fieldType === FieldType.Tags) {
      items.forEach((item) => {
        const checkedMap = GeneralDataHelper.extractCheckedMapForValue(item[dataKey], field)
        item[dataKey] = GeneralDataHelper.getCheckedTagsForField(field, checkedMap).join(', ')
      })
    } else if (field.fieldType === FieldType.MultiEnum) {
      items.forEach((item) => {
        const checkedMap = GeneralDataHelper.extractMultiEnumCheckedMapForValue(item[dataKey], field.options)
        item[dataKey] = GeneralDataHelper.getCheckedTagsForField(field, checkedMap).join(', ')
      })
    }
  }

  public async transferItemsValueNaturalLanguage(items: any[]) {
    const dataModel = this._dataModel
    const modelFields = await dataModel.getFields()
    for (const plugin of _DatawichService.plugins) {
      if (plugin.onDataFound) {
        for (const item of items) {
          await plugin.onDataFound(item, dataModel)
        }
      }
    }
    modelFields.forEach((field) => {
      const dataKey = GeneralDataHelper.calculateDataKey(field)
      this._transferItemsValueNaturalLanguage(items, field.modelForClient(), dataKey)
    })
    const fieldLinks = await dataModel.getFieldLinks()
    for (const link of fieldLinks) {
      const refFields = await link.getRefFields()
      refFields.forEach((refField) => {
        const dataKey = GeneralDataHelper.calculateDataKey(refField, link)
        this._transferItemsValueNaturalLanguage(items, refField.modelForClient(), dataKey)
      })
    }
    return items
  }

  public async describeDataItems(items: any[]) {
    items = items.map((item) => {
      return { ...item }
    })
    const descriptionFields = await this.makeDescriptionFields()
    await this.transferItemsValueNaturalLanguage(items)
    return items.map((item) => {
      const infos = descriptionFields.map((descriptionField) => {
        return `${descriptionField.name}: ${item[descriptionField.dataKey] || ''}`
      })
      return infos.join('\n')
    })
  }

  public async exportDataExcel(options = {}) {
    const searcher = await this.dataSearcherWithFilter(options)
    searcher.setLimitInfo(-1, -1)
    const items = (await searcher.queryList()) as any[]
    await this.transferItemsValueNaturalLanguage(items)

    const descriptionFields = await this.makeDescriptionFields(true)
    if (descriptionFields.find((field) => field.fieldKey === 'author') === undefined) {
      descriptionFields.unshift({
        fieldKey: 'author',
        dataKey: 'author',
        fieldType: FieldType.Dummy,
        name: '创建者邮箱',
      })
    }

    const fields: DescribableField[] = []
    fields.push({
      fieldKey: '_data_id',
      dataKey: '_data_id',
      fieldType: FieldType.Dummy,
      name: '流水号',
    })
    fields.push(...descriptionFields)
    fields.push({
      fieldKey: '_ignore',
      dataKey: '_ignore',
      name: '1',
      fieldType: FieldType.Dummy,
    })

    const columnKeys = fields.map((field) => field.dataKey)
    const nameRowData = fields.reduce((result, field) => {
      result[field.dataKey] = field.name
      return result
    }, {})
    const filePath = _DatawichService.generateRandomTmpPath()
    const excel = new TypicalExcel(columnKeys, {
      writeFilePath: filePath,
    })
    excel.addExtraHeader(nameRowData)
    excel.addRowList(items)
    await excel.commit()
    return filePath
  }

  public async exportDataExcelV2(options = {}) {
    const searcher = await this.dataSearcherWithFilter(options)
    const items = (await searcher.queryList()) as any[]
    await this.transferItemsValueNaturalLanguage(items)

    const descriptionFields = await this.makeDescriptionFields(true)
    if (descriptionFields.find((field) => field.fieldKey === 'author') === undefined) {
      descriptionFields.unshift({
        fieldKey: 'author',
        dataKey: 'author',
        fieldType: FieldType.Dummy,
        name: '创建者邮箱',
      })
    }

    const fields: DescribableField[] = []
    fields.push({
      fieldKey: '_data_id',
      dataKey: '_data_id',
      fieldType: FieldType.Dummy,
      name: '流水号',
    })
    fields.push(...descriptionFields)
    fields.push({
      fieldKey: '_ignore',
      dataKey: '_ignore',
      fieldType: FieldType.Dummy,
      name: '1',
    })

    const columnKeys = fields.map((field) => field.dataKey)
    const nameRowData = fields.reduce((result, field) => {
      result[field.dataKey] = field.name
      return result
    }, {})

    const chunkSize = 3000
    const tmpPath = _DatawichService.generateRandomTmpPath()
    const buffer = fs.createWriteStream(tmpPath)
    const archive = archiver('zip')
    archive.pipe(buffer)
    logger.info(`开始归档... chunkSize = ${chunkSize}`)
    for (let i = 0; i < items.length; i += chunkSize) {
      logger.info(`Progress: ${i} / ${items.length}`)
      const excel = new TypicalExcel(columnKeys)
      excel.addExtraHeader(nameRowData)
      for (let j = 0; j < chunkSize && i + j < items.length; ++j) {
        excel.addRow(items[i + j])
      }
      const tmpBuffer = await excel.writeBuffer()
      archive.append(tmpBuffer, {
        name: `${this._dataModel.modelKey}_${Math.floor(i / chunkSize) + 1}.xlsx`,
      })
    }
    logger.info(`归档中...`)
    await archive.finalize()
    logger.info(`已归档`)
    return tmpPath
  }

  public async exportDataExcelBufferTest(options = {}) {
    const searcher = await this.dataSearcherWithFilter(options)
    const items = (await searcher.queryList()) as any[]
    await this.transferItemsValueNaturalLanguage(items)

    const descriptionFields = await this.makeDescriptionFields(true)
    if (descriptionFields.find((field) => field.fieldKey === 'author') === undefined) {
      descriptionFields.unshift({
        fieldKey: 'author',
        dataKey: 'author',
        fieldType: FieldType.Dummy,
        name: '创建者邮箱',
      })
    }

    const fields: DescribableField[] = []
    fields.push({
      fieldKey: '_data_id',
      dataKey: '_data_id',
      fieldType: FieldType.Dummy,
      name: '流水号',
    })
    fields.push(...descriptionFields)

    const chunkSize = 10000
    const tmpPath = _DatawichService.generateRandomTmpPath()
    const buffer = fs.createWriteStream(tmpPath)
    const archive = archiver('zip')
    archive.pipe(buffer)

    for (let i = 0; i < items.length; i += chunkSize) {
      logger.info(`Progress: ${i} / ${items.length}`)
      const maker = new CsvMaker()
      maker.setColumns(fields.map((field) => field.dataKey))
      maker.pushData(
        fields.reduce((result, field) => {
          result[field.dataKey] = field.name
          return result
        }, {})
      )
      for (let j = 0; j < chunkSize && i + j < items.length; ++j) {
        maker.pushData(items[i + j])
      }
      archive.append(Buffer.from(maker.makeContent()), {
        name: `${this._dataModel.modelKey}_${Math.floor(i / chunkSize) + 1}.csv`,
      })
    }
    logger.info(`归档中...`)
    await archive.finalize()
    logger.info(`已归档`)
    return tmpPath
  }

  public async findDataWithDataId(dataId: string) {
    const tableName = this._dataModel.sqlTableName()
    const searcher = await this.dataSearcherWithFilter()
    searcher.addConditionKV(`${tableName}._data_id`, dataId)
    const data = await searcher.querySingle()
    return await this.convertData(data)
  }

  public async forcePutData(customData: any) {
    const dataModel = this._dataModel
    const dataHandler = new ModelDataHandler(dataModel)
    dataHandler.setOperator(this._operator)

    const { rid, dataId } = customData
    let dataInfo: ModelDataInfo | undefined = undefined
    if (rid) {
      dataInfo = (await ModelDataInfo.findWithRid(dataModel, rid))!
      assert.ok(!!dataInfo, `数据不存在 rid = ${rid}`)
    }
    if (dataId) {
      dataInfo = (await ModelDataInfo.findDataInfo(dataModel, dataId))!
      assert.ok(!!dataInfo, `数据不存在 dataId = ${dataId}`)
    }
    if (!dataInfo) {
      const indexes = await dataModel.getUniqueIndexes()
      for (const columnIndex of indexes) {
        if (customData[columnIndex.fieldKey]) {
          const tableName = dataModel.sqlTableName()
          const searcher = await this.dataSearcher()
          searcher.addSpecialCondition(
            `\`${tableName}\`.\`${columnIndex.fieldKey}\` = ?`,
            customData[columnIndex.fieldKey]
          )
          const rawData = await searcher.querySingle()
          if (rawData) {
            dataInfo = new ModelDataInfo(dataModel, rawData['_data_id'])
            break
          }
        }
      }
    }
    if (dataInfo) {
      await dataHandler.modifyModelData(dataInfo, customData)
      return new ModelDataInfo(dataModel, dataInfo.dataId)
    }
    return this.createData(customData)
  }

  public async createData(customData: any) {
    delete customData['rid']
    const dataModel = this._dataModel
    customData = {
      ...customData,
      author: this._operator,
      update_author: this._operator,
    }
    customData = await dataModel.getClearData(customData)
    await this.assertParamsValid(customData)
    const fields = await dataModel.getFields()
    const database = ModelDataInfo.database
    const dataInfo = new ModelDataInfo(dataModel, makeUUID())
    const adder = database.adder()
    adder.setTable(dataModel.sqlTableName())
    adder.insertKV('_data_id', dataInfo.dataId)
    for (const field of fields) {
      const fieldKey = field.fieldKey
      if (fieldKey in customData) {
        if (field.fieldType === FieldType.Datetime) {
          if (customData[fieldKey]) {
            adder.insertKVForTimestamp(fieldKey, customData[fieldKey])
          }
        } else if (field.fieldType === FieldType.StringList) {
          adder.insertKV(fieldKey, JSON.stringify(customData[fieldKey]))
        } else {
          adder.insertKV(fieldKey, customData[fieldKey])
        }
      } else {
        if (field.useDefault) {
          adder.insertKV(fieldKey, field.defaultValue)
        }
      }
    }
    await adder.execute()
    return dataInfo
  }

  public async createMultipleData(customDataList: any[]) {
    const dataModel = this._dataModel
    const dataList: any[] = []
    for (const item of customDataList) {
      const data = await dataModel.getClearData({
        ...item,
        author: this._operator,
        update_author: this._operator,
      })
      await this.assertParamsValid(data)
      dataList.push(data)
    }

    const fields = await dataModel.getFields()
    const database = ModelDataInfo.database
    const runner = database.createTransactionRunner()
    const infoList: ModelDataInfo[] = []
    // TODO: 批量插入性能更佳
    await runner.commit(async (transaction) => {
      for (const customData of dataList) {
        const dataId = makeUUID()
        const adder = database.adder()
        adder.transaction = transaction
        adder.setTable(dataModel.sqlTableName())
        adder.insertKV('_data_id', dataId)
        for (const field of fields) {
          const fieldKey = field.fieldKey
          if (fieldKey in customData) {
            if (field.fieldType === FieldType.Datetime) {
              if (customData[fieldKey]) {
                adder.insertKVForTimestamp(fieldKey, customData[fieldKey])
              }
            } else if (field.fieldType === FieldType.StringList) {
              adder.insertKV(fieldKey, JSON.stringify(customData[fieldKey]))
            } else {
              adder.insertKV(fieldKey, customData[fieldKey])
            }
          }
        }
        await adder.execute()
        infoList.push(new ModelDataInfo(dataModel, dataId))
      }
    })
    return infoList
  }

  public async modifyModelData(dataInfo: ModelDataInfo, params: any) {
    delete params['author']
    params['update_author'] = this._operator
    const dataModel = this._dataModel
    params = await dataModel.getClearData(params)
    await this.assertParamsValid(params, dataInfo.dataId)
    const fields = await dataModel.getFields()
    const database = ModelDataInfo.database
    const runner = database.createTransactionRunner()
    await runner.commit(async (transaction) => {
      const modifier = database.modifier()
      modifier.transaction = transaction
      modifier.setTable(dataModel.sqlTableName())
      modifier.addConditionKV('_data_id', dataInfo.dataId)
      for (const field of fields) {
        const fieldKey = field.fieldKey
        if (fieldKey in params) {
          if (field.fieldType === FieldType.Datetime) {
            if (params[fieldKey]) {
              modifier.updateKVForTimestamp(fieldKey, params[fieldKey])
            }
          } else if (field.fieldType === FieldType.StringList) {
            modifier.updateKV(fieldKey, JSON.stringify(params[fieldKey]))
          } else {
            modifier.updateKV(fieldKey, params[fieldKey])
          }
        }
      }
      await modifier.execute()
    })
  }

  public async makeReadableInfosForClient(dataInfo: ModelDataInfo) {
    const dataHandler = new ModelDataHandler(dataInfo.dataModel)
    const data = await dataInfo.readableData()
    const descriptionFields = await dataHandler.makeDescriptionFields(true)
    return descriptionFields.map((descriptionField) => {
      const result = {
        label: descriptionField.name,
        value: data[descriptionField.dataKey] || '',
      }
      if (descriptionField.fieldType === FieldType.Attachment) {
        try {
          const entity: OssFileInfo = JSON.parse(data[descriptionField.dataKey])
          entity.url = _DatawichService.ossForSignature.signatureURL(entity.ossKey)
          result['htmlValue'] = `<a href="${entity.url}" target="_blank">点击查看</a>`
        } catch (e) {}
      } else if (descriptionField.fieldType === FieldType.MultipleLinesText) {
        result['htmlValue'] = `${result.value}`.replace(/\n/g, '<br />')
      } else if (descriptionField.fieldType === FieldType.RichText) {
        result['htmlValue'] = result.value
      }
      return result
    })
  }

  public async findRecordWith(params: any) {
    const dataModel = this._dataModel
    // 检查 Unique 约束
    const indexes = await dataModel.getUniqueIndexes()
    for (const columnIndex of indexes) {
      if (params[columnIndex.fieldKey]) {
        const tableName = dataModel.sqlTableName()
        const searcher = await this.dataSearcher()
        searcher.addSpecialCondition(`\`${tableName}\`.\`${columnIndex.fieldKey}\` = ?`, params[columnIndex.fieldKey])
        if ((await searcher.queryCount()) > 0) {
          return true
        }
      }
    }
    return false
  }

  private async assertParamsValid(params: any, curDataId = '') {
    const dataModel = this._dataModel
    const invalidMap = await this.getInvalidMap(params, curDataId)

    // 检查 Unique 约束
    const indexes = await dataModel.getUniqueIndexes()
    for (const columnIndex of indexes) {
      if (params[columnIndex.fieldKey]) {
        const tableName = dataModel.sqlTableName()
        const searcher = await this.dataSearcher()
        searcher.addSpecialCondition(`\`${tableName}\`.\`${columnIndex.fieldKey}\` = ?`, params[columnIndex.fieldKey])
        if (curDataId) {
          searcher.addSpecialCondition(`${tableName}._data_id != ?`, curDataId)
        }
        if ((await searcher.queryCount()) > 0) {
          invalidMap[columnIndex.fieldKey] = `${columnIndex.fieldKey} = ${params[columnIndex.fieldKey]} 数据已存在`
        }
      }
    }
    const invalidKeys = Object.keys(invalidMap)
    assert.ok(invalidKeys.length === 0, invalidMap[invalidKeys[0]])
  }

  public async getInvalidMap(params: any, curDataId = '') {
    const dataModel = this._dataModel
    const fields = (await dataModel.getFields()).map((field) => field.modelForClient())
    const errorMap: { [p: string]: string } = GeneralDataChecker.calcSimpleInvalidMap(params, fields, curDataId)
    for (const plugin of _DatawichService.plugins) {
      if (plugin.onParamsCheck) {
        Object.assign(errorMap, await plugin.onParamsCheck(params, dataModel))
      }
    }
    // 检查外键约束
    const foreignLinkMap = await dataModel.getForeignLinkMap()
    for (const field of fields) {
      if (field.fieldKey in params) {
        const value = params[field.fieldKey]
        if (foreignLinkMap[field.fieldKey]) {
          const link = foreignLinkMap[field.fieldKey]
          const referenceModel = await _DataModel.findModel(link.refModel)
          const refTableName = referenceModel.sqlTableName()
          const searcher = await new ModelDataHandler(referenceModel).dataSearcher()
          searcher.addSpecialCondition(`\`${refTableName}\`.\`${link.refField}\` = ?`, value)
          if ((await searcher.queryCount()) === 0) {
            errorMap[field.fieldKey] = `${field.name} -> ${link.referenceKey()} 关联数据不存在`
          }
        }
      }
    }
    return errorMap
  }
}

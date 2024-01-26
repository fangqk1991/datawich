import { FilterOptions, SearcherTools } from 'fc-feed'
import { SearchBuilder } from '@fangcha/tools/lib/database'
import { SQLSearcher } from 'fc-sql'
import assert from '@fangcha/assert'
import { _ModelField } from '../models/extensions/_ModelField'
import { FieldHelper, FieldType, GeneralDataHelper, ModelFieldModel } from '@fangcha/datawich-service'
import { _DataModel } from '../models/extensions/_DataModel'
import { _FieldLink } from '../models/extensions/_FieldLink'
import { FilterCondition, FilterSymbol, FilterSymbolDescriptor } from '@fangcha/logic'

interface SearchableField {
  tableColumnName: string
  field: ModelFieldModel
}

interface SearchOptions extends FilterOptions {
  conditions?: FilterCondition[]
}

export class WideSearcherBuilder {
  mainModel!: _DataModel
  mainFields!: ModelFieldModel[]
  mainFieldMap!: { [p: string]: ModelFieldModel }
  fieldLinks!: _FieldLink[]
  filterOptions!: SearchOptions
  userColumnNames: string[]
  searchableFields: SearchableField[] = []

  constructor(dataModel: _DataModel) {
    this.mainModel = dataModel
    this.mainFields = []
    this.fieldLinks = []
    this.filterOptions = {}
    this.userColumnNames = []
    this.searchableFields = []
  }

  public setMainFields(fields: _ModelField[], fieldLinks: _FieldLink[]) {
    this.mainFields = fields.map((field) => field.modelForClient())
    this.fieldLinks = fieldLinks
    this.mainFieldMap = this.mainFields.reduce((result, cur) => {
      result[cur.fieldKey] = cur
      return result
    }, {})
    return this
  }

  public setFilterOptions(filterOptions: SearchOptions) {
    this.filterOptions = filterOptions
    return this
  }

  public async makeSearcher() {
    const dataModel = this.mainModel

    const filterMapper: {
      [p: string]: {
        columnName: string
        field: ModelFieldModel
      }
    } = {}
    const mainTableName = dataModel.sqlTableName()
    let bigTable = dataModel.sqlTableName()
    const columns: string[] = []
    columns.push(`${mainTableName}.rid AS rid`)
    columns.push(`${mainTableName}._data_id AS _data_id`)
    columns.push(`${mainTableName}._data_id AS data_id`)
    const userColumnNames: string[] = []
    const searchableFields: SearchableField[] = []
    for (const field of this.mainFields) {
      if (field.extrasData.bigText) {
        continue
      }
      const leftColumnName = `${mainTableName}.${field.fieldKey}`
      columns.push(`${leftColumnName} AS \`${field.fieldKey}\``)
      const filterKey = GeneralDataHelper.calculateFilterKey(field)
      filterMapper[filterKey] = {
        columnName: leftColumnName,
        field: field,
      }
      if (field.fieldType === FieldType.User) {
        userColumnNames.push(leftColumnName)
      }
      searchableFields.push({
        tableColumnName: leftColumnName,
        field: field,
      })
    }
    for (const link of this.fieldLinks) {
      const refTable = link.refTableName()
      const refTableAlias = `${link.fieldKey}_${refTable}`
      const linkColumnName = `${refTableAlias}.${link.refField}`
      const curColumnName = `${dataModel.sqlTableName()}.${link.fieldKey}`
      bigTable = `${bigTable} LEFT JOIN ${refTable} AS ${refTableAlias} ON ${curColumnName} = ${linkColumnName}`
      const refFields = await link.getRefFields()
      for (const refViceField of refFields.map((field) => field.modelForClient())) {
        if (refViceField.extrasData.bigText) {
          continue
        }
        const refViceColumn = GeneralDataHelper.calculateDataKey(refViceField, link)
        const leftColumnName = `${refTableAlias}.${refViceField.fieldKey}`
        columns.push(`${leftColumnName} AS \`${refViceColumn}\``)
        filterMapper[GeneralDataHelper.calculateFilterKey(refViceField, link)] = {
          columnName: leftColumnName,
          field: refViceField,
        }
        if (refViceField.fieldType === FieldType.User) {
          userColumnNames.push(leftColumnName)
        }
        searchableFields.push({
          tableColumnName: leftColumnName,
          field: refViceField,
        })
      }
    }
    this.userColumnNames = userColumnNames
    this.searchableFields = searchableFields

    const filterKeys = Object.keys(filterMapper)
    const searcher = dataModel.dbSpec().database.searcher()
    searcher.setTable(bigTable)
    searcher.setColumns(columns)
    SearcherTools.injectConditions(searcher, {
      colsMapper: filterKeys.reduce((result, key) => {
        result[key] = filterMapper[key].columnName
        return result
      }, {}),
      // withoutFilterCols: filterKeys.filter((key) =>
      //   [FieldType.Datetime].includes(filterMapper[key].field.fieldType as FieldType)
      // ),
      exactSearchCols: [],
      fuzzySearchCols: [],
      gbkCols: [],
      params: this.filterOptions,
      timestampTypeCols: [],
    })
    const options = this.filterOptions

    const conditions = options.conditions as FilterCondition[]
    if (Array.isArray(conditions)) {
      for (const condition of conditions.filter((condition) => condition.leftKey in filterMapper)) {
        assert.ok(FilterSymbolDescriptor.checkValueValid(condition.symbol), `condition.symbol invalid`)
        const entity = filterMapper[condition.leftKey]
        const columnName = entity.columnName
        switch (condition.symbol) {
          case FilterSymbol.IN:
            assert.ok(Array.isArray(condition.rightValue), `${columnName}-IN's rightValue must be an array`)
            searcher.addConditionKeyInArray(columnName, condition.rightValue as [])
            break
          case FilterSymbol.EQ:
          case FilterSymbol.GE:
          case FilterSymbol.LE:
          case FilterSymbol.GT:
          case FilterSymbol.LT:
            searcher.addSpecialCondition(`${columnName} ${condition.symbol} ?`, condition.rightValue as number)
            break
        }
      }
    }
    // for (const rawKey of Object.keys(options)) {
    //   const filterKey = rawKey
    //   if (!filterMapper[filterKey] || !options[rawKey]) {
    //     continue
    //   }
    //   const filterValue = options[rawKey]
    //   const entity = filterMapper[filterKey]
    //   const columnName = entity.columnName
    //   const field = entity.field
    //   switch (field.fieldType as FieldType) {
    //     case FieldType.Datetime:
    //       if (Array.isArray(filterValue) && filterValue.length === 2) {
    //         const [startStr, endStr] = filterValue
    //         const startMoment = moment.utc(startStr)
    //         const endMoment = moment.utc(endStr)
    //         if (/^\d{4}-\d{2}-\d{2}$/.test(startStr)) {
    //           startMoment.startOf('day')
    //         }
    //         if (/^\d{4}-\d{2}-\d{2}$/.test(endStr)) {
    //           endMoment.endOf('day')
    //         }
    //         searcher.addSpecialCondition(
    //           `${columnName} BETWEEN FROM_UNIXTIME(?) AND FROM_UNIXTIME(?)`,
    //           startMoment.unix(),
    //           endMoment.unix()
    //         )
    //       }
    //       break
    //   }
    // }
    return searcher
  }

  private filterAuthorIfNeed(searcher: SQLSearcher) {
    const options = this.filterOptions
    const tableName = this.mainModel.sqlTableName()
    if (options.author) {
      searcher.addConditionKV(`${tableName}.author`, options.author)
    }
  }

  private lockUserIfNeed(searcher: SQLSearcher) {
    const options = this.filterOptions
    const tableName = this.mainModel.sqlTableName()
    if (options.lockedUser && options.relatedUser) {
      const lockedUser = options.lockedUser
      const relatedUser = options.relatedUser
      const builder = new SearchBuilder()
      builder.addCondition(`${tableName}.author = ?`, lockedUser)
      this.userColumnNames.forEach((columnName) => {
        builder.addCondition(`${columnName} = ?`, relatedUser)
      })
      builder.injectToSearcher(searcher)
    }
  }

  private addFuzzySearchConditions(searcher: SQLSearcher) {
    const options = this.filterOptions
    if (typeof options['keywords'] === 'string' && options['keywords'].trim().length > 0) {
      const keywords = options['keywords'].trim()
      const keywordsLike = `%${keywords}%`
      const builder = new SearchBuilder()
      builder.useSorting()

      const searchFields = this.searchableFields
      if (/^\d+$/.test(keywords)) {
        searchFields
          .filter((searchField) => searchField.field.fieldType === FieldType.Integer)
          .forEach((searchField) => {
            builder.addCondition(`${searchField.tableColumnName} = ?`, keywords)
          })
      }
      searchFields
        .filter((searchField) => FieldHelper.checkExactSearchableField(searchField.field.fieldType as FieldType))
        .forEach((searchField) => {
          builder.addCondition(`${searchField.tableColumnName} = ? COLLATE utf8mb4_general_ci`, keywords)
        })
      searchFields
        .filter((searchField) => FieldHelper.checkSearchableField(searchField.field.fieldType as FieldType))
        .forEach((searchField) => {
          builder.addCondition(`${searchField.tableColumnName} LIKE ? COLLATE utf8mb4_general_ci`, keywordsLike)
        })
      builder.injectToSearcher(searcher)
    }
  }

  lockDataIdIfNeed(searcher: SQLSearcher) {
    const dataId = this.filterOptions.dataId || this.filterOptions._data_id || ''
    const tableName = this.mainModel.sqlTableName()
    if (dataId) {
      searcher.addConditionKV(`${tableName}._data_id`, dataId)
    }
  }

  public async build() {
    const searcher = await this.makeSearcher()
    this.lockDataIdIfNeed(searcher)
    this.filterAuthorIfNeed(searcher)
    this.lockUserIfNeed(searcher)
    this.addFuzzySearchConditions(searcher)
    return searcher
  }
}

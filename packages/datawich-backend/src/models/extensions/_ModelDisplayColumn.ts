import __ModelDisplayColumn from '../auto-build/__ModelDisplayColumn'
import { Transaction } from 'fc-sql'
import { makeUUID } from '@fangcha/tools'
import { ModelDisplayColumnModel } from '@web/datawich-common/models'

export class _ModelDisplayColumn extends __ModelDisplayColumn {
  public constructor() {
    super()
  }

  public static makeValidParams(params: Partial<ModelDisplayColumnModel>) {
    const options: Partial<ModelDisplayColumnModel> = {}
    if (params.columnName !== undefined) {
      options.columnName = params.columnName
    }
    if (params.contentTmpl !== undefined) {
      options.contentTmpl = params.contentTmpl
    }
    if (params.modelKey !== undefined) {
      options.modelKey = params.modelKey
    }
    if (params.refModelKey !== undefined) {
      options.refModelKey = params.refModelKey
    }
    if (params.modelKey !== undefined) {
      options.modelKey = params.modelKey
    }
    if (params.displayScope !== undefined) {
      options.displayScope = params.displayScope
    }
    if (params.isTemplate !== undefined) {
      options.isTemplate = params.isTemplate
    }
    return options
  }

  public async updateDisplayColumn(params: Partial<ModelDisplayColumnModel>, transaction?: Transaction) {
    this.fc_edit()
    const option = _ModelDisplayColumn.makeValidParams(params)
    this.fc_generateWithModel(option)
    await this.updateToDB(transaction)
  }

  public static async generateModelDisplayColumn(option: Partial<ModelDisplayColumnModel>, transaction?: Transaction) {
    const column = new _ModelDisplayColumn()
    column.columnKey = makeUUID()
    if (option.columnName !== undefined) {
      column.columnName = option.columnName
    }
    if (option.contentTmpl !== undefined) {
      column.contentTmpl = option.contentTmpl
    }
    if (option.modelKey !== undefined) {
      column.modelKey = option.modelKey
    }
    if (option.contentTmpl !== undefined) {
      column.contentTmpl = option.contentTmpl
    }
    if (option.refModelKey !== undefined) {
      column.refModelKey = option.refModelKey
    }
    if (option.displayScope !== undefined) {
      column.displayScope = option.displayScope
    }
    if (option.isTemplate !== undefined) {
      column.isTemplate = option.isTemplate
    }
    await column.addToDB(transaction)
  }
}

import { SpecFactory } from '@fangcha/router'
import { FangchaSession } from '@fangcha/session'
import { OpenLevel, SdkDBDataApis } from '@fangcha/datawich-service'
import { DBDataSpecHandler, DBHandleSDK, TableDataHandler } from '../core'
import assert from '@fangcha/assert'
import { FilterOptions } from 'fc-feed'

const factory = new SpecFactory('DB Data SDK')

factory.prepare(SdkDBDataApis.TableSchemaGet, async (ctx) => {
  await new DBDataSpecHandler(ctx).handleTable(async (table) => {
    ctx.body = table
  })
})

factory.prepare(SdkDBDataApis.RecordPageDataGet, async (ctx) => {
  await new DBDataSpecHandler(ctx).handleTable(async (table, connection) => {
    const database = DBHandleSDK.getDatabase(connection)
    const options = ctx.request.query as FilterOptions
    const session = ctx.session as FangchaSession
    const authorField = table.fields.find((field) => field.isAuthor)
    if (!session.checkVisitorIsAdmin()) {
      assert.ok(!!authorField, 'Only admin can access it.')
      switch (table.openLevel) {
        case OpenLevel.Private:
          options[authorField!.fieldKey] = session.curUserStr()
          break
      }
    }
    ctx.body = await new TableDataHandler(database, table).getPageResult(options)
  })
})

factory.prepare(SdkDBDataApis.RecordItemsGet, async (ctx) => {
  await new DBDataSpecHandler(ctx).handleTable(async (table, connection) => {
    const database = DBHandleSDK.getDatabase(connection)
    const options = ctx.request.query as FilterOptions
    const session = ctx.session as FangchaSession
    const authorField = table.fields.find((field) => field.isAuthor)
    if (!session.checkVisitorIsAdmin()) {
      assert.ok(!!authorField, 'Only admin can access it.')
      switch (table.openLevel) {
        case OpenLevel.Private:
          options[authorField!.fieldKey] = session.curUserStr()
          break
      }
    }
    options._length = Math.max(Math.min(options._length || 100, 10000), 0)
    const searcher = new TableDataHandler(database, table).getSearcher(options)
    ctx.body = await searcher.queryList()
  })
})

factory.prepare(SdkDBDataApis.RecordCreate, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new DBDataSpecHandler(ctx).handleTable(async (table, connection) => {
    const database = DBHandleSDK.getDatabase(connection)
    ctx.body = await new TableDataHandler(database, table).createRecord(ctx.request.body, session.curUserStr())
    ctx.status = 200
  })
})

factory.prepare(SdkDBDataApis.RecordInfoGet, async (ctx) => {
  await new DBDataSpecHandler(ctx).handleRecord(async (record) => {
    ctx.body = record
  })
})

factory.prepare(SdkDBDataApis.RecordUpdate, async (ctx) => {
  await new DBDataSpecHandler(ctx).handleRecord(async (record, table, connection) => {
    const database = DBHandleSDK.getDatabase(connection)
    await new TableDataHandler(database, table).updateDataRecord(record, ctx.request.body)
    ctx.status = 200
  })
})

factory.prepare(SdkDBDataApis.RecordDelete, async (ctx) => {
  await new DBDataSpecHandler(ctx).handleRecord(async (record, table, connection) => {
    const database = DBHandleSDK.getDatabase(connection)
    await new TableDataHandler(database, table).deleteDataRecord(record)
    ctx.status = 200
  })
})

export const DBDataSpecs = factory.buildSpecs()

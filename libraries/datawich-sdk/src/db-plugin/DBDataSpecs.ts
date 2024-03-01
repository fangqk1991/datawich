import { SpecFactory } from '@fangcha/router'
import { FangchaSession } from '@fangcha/session'
import { SdkDBDataApis } from '@fangcha/datawich-service'
import { DatabaseHandler, DBDataSpecHandler, TableDataHandler } from '../core'

const factory = new SpecFactory('DB Data SDK')

factory.addPreHandler(async (ctx, next) => {
  const session = ctx.session as FangchaSession
  session.assertVisitorIsAdmin()
  await next()
})

factory.prepare(SdkDBDataApis.RecordPageDataGet, async (ctx) => {
  await new DBDataSpecHandler(ctx).handleTable(async (table, connection) => {
    const database = new DatabaseHandler(connection).database()
    ctx.body = await new TableDataHandler(database, table).getPageResult(ctx.request.query)
  })
})

factory.prepare(SdkDBDataApis.RecordCreate, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new DBDataSpecHandler(ctx).handleTable(async (table, connection) => {
    const database = new DatabaseHandler(connection).database()
    await new TableDataHandler(database, table).createRecord(ctx.request.body, session.curUserStr())
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
    const database = new DatabaseHandler(connection).database()
    await new TableDataHandler(database, table).updateDataRecord(record, ctx.request.body)
    ctx.status = 200
  })
})

factory.prepare(SdkDBDataApis.RecordDelete, async (ctx) => {
  await new DBDataSpecHandler(ctx).handleRecord(async (record, table, connection) => {
    const database = new DatabaseHandler(connection).database()
    await new TableDataHandler(database, table).deleteDataRecord(record)
    ctx.status = 200
  })
})

export const DBDataSpecs = factory.buildSpecs()

import { SpecFactory } from '@fangcha/router'
import { DatabaseApis } from '@web/datawich-common/admin-apis'
import { FangchaSession } from '@fangcha/session'
import { DBSchemaHelper, TableDataHandler } from '@fangcha/datawich-sdk'
import { _DBConnection } from '../../../../models/database/_DBConnection'
import { DatabaseHandler } from '../../../../services/DatabaseHandler'

const factory = new SpecFactory('Database')

factory.addPreHandler(async (ctx, next) => {
  const session = ctx.session as FangchaSession
  session.assertVisitorIsAdmin()
  await next()
})

factory.prepare(DatabaseApis.ConnectionListGet, async (ctx) => {
  const searcher = new _DBConnection().fc_searcher(ctx.request.query)
  ctx.body = await searcher.queryJsonFeeds()
})

factory.prepare(DatabaseApis.ConnectionCreate, async (ctx) => {
  const connection = await DatabaseHandler.generateConnection(ctx.request.body)
  ctx.body = connection.modelForClient()
})

factory.prepare(DatabaseApis.ConnectionPing, async (ctx) => {
  const handler = await DatabaseHandler.makeHandler(ctx.params.connectionId)
  await handler.ping()
  ctx.status = 200
})

factory.prepare(DatabaseApis.ConnectionUpdate, async (ctx) => {
  const handler = await DatabaseHandler.makeHandler(ctx.params.connectionId)
  await handler.updateInfos(ctx.request.body)
  ctx.body = handler.connection.modelForClient()
})

factory.prepare(DatabaseApis.ConnectionDelete, async (ctx) => {
  const handler = await DatabaseHandler.makeHandler(ctx.params.connectionId)
  await handler.connection.deleteFromDB()
  ctx.status = 200
})

factory.prepare(DatabaseApis.ConnectionInfoGet, async (ctx) => {
  const handler = await DatabaseHandler.makeHandler(ctx.params.connectionId)
  ctx.body = await handler.connection.modelForClient()
})

factory.prepare(DatabaseApis.DatabaseSchemaGet, async (ctx) => {
  const handler = await DatabaseHandler.makeHandler(ctx.params.connectionId)
  ctx.body = await handler.getSchemaInfo()
})

factory.prepare(DatabaseApis.TableSchemaGet, async (ctx) => {
  const handler = await DatabaseHandler.makeHandler(ctx.params.connectionId)
  await handler.handle(async (database) => {
    ctx.body = await DBSchemaHelper.getTableSchema(database, ctx.params.tableId)
  })
})

factory.prepare(DatabaseApis.RecordPageDataGet, async (ctx) => {
  const handler = await DatabaseHandler.makeHandler(ctx.params.connectionId)
  await handler.handle(async (database) => {
    const table = await DBSchemaHelper.getTableSchema(database, ctx.params.tableId)
    ctx.body = await new TableDataHandler(database, table).getPageResult(ctx.request.query)
  })
})

factory.prepare(DatabaseApis.RecordCreate, async (ctx) => {
  const handler = await DatabaseHandler.makeHandler(ctx.params.connectionId)
  await handler.handle(async (database) => {
    const table = await DBSchemaHelper.getTableSchema(database, ctx.params.tableId)
    await new TableDataHandler(database, table).createRecord(ctx.request.body)
    ctx.status = 200
  })
})

export const DatabaseSpecs = factory.buildSpecs()

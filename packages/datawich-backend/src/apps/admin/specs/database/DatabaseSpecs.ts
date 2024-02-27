import { SpecFactory } from '@fangcha/router'
import { DatabaseApis } from '@web/datawich-common/admin-apis'
import { FangchaSession } from '@fangcha/session'
import { MyDatabase } from '../../../../services/MyDatabase'
import { DBSchemaHelper, TableDataHandler } from '@fangcha/datawich-sdk'
import { _DBConnection } from '../../../../models/database/_DBConnection'
import { Context } from 'koa'
import assert from '@fangcha/assert'

const factory = new SpecFactory('Database')

factory.addPreHandler(async (ctx, next) => {
  const session = ctx.session as FangchaSession
  session.assertVisitorIsAdmin()
  await next()
})

const prepareConnection = async (ctx: Context) => {
  const connection = await _DBConnection.findWithUid(ctx.params.uid)
  assert.ok(!!connection, '_DBConnection Not Found')
  return connection!
}

factory.prepare(DatabaseApis.ConnectionListGet, async (ctx) => {
  const searcher = new _DBConnection().fc_searcher(ctx.request.query)
  ctx.body = await searcher.queryJsonFeeds()
})

factory.prepare(DatabaseApis.ConnectionCreate, async (ctx) => {
  const connection = await _DBConnection.generateConnection(ctx.request.body)
  ctx.body = connection.modelForClient()
})

factory.prepare(DatabaseApis.ConnectionUpdate, async (ctx) => {
  const connection = await prepareConnection(ctx)
  await connection.updateInfos(ctx.request.body)
  ctx.body = connection.modelForClient()
})

factory.prepare(DatabaseApis.ConnectionDelete, async (ctx) => {
  const connection = await prepareConnection(ctx)
  await connection.deleteFromDB()
  ctx.status = 200
})

factory.prepare(DatabaseApis.DBTableListGet, async (ctx) => {
  ctx.body = await MyDatabase.datawichDB.getTables()
})

factory.prepare(DatabaseApis.TableSchemaGet, async (ctx) => {
  const tableName = ctx.params.tableName
  ctx.body = await DBSchemaHelper.getTableSchema(MyDatabase.datawichDB, tableName)
})

factory.prepare(DatabaseApis.RecordPageDataGet, async (ctx) => {
  const tableName = ctx.params.tableName
  const table = await DBSchemaHelper.getTableSchema(MyDatabase.datawichDB, tableName)
  ctx.body = await new TableDataHandler(MyDatabase.datawichDB, table).getPageResult(ctx.request.query)
})

factory.prepare(DatabaseApis.RecordCreate, async (ctx) => {
  const tableName = ctx.params.tableName
  const table = await DBSchemaHelper.getTableSchema(MyDatabase.datawichDB, tableName)
  await new TableDataHandler(MyDatabase.datawichDB, table).createRecord(ctx.request.body)
  ctx.status = 200
})

export const DatabaseSpecs = factory.buildSpecs()

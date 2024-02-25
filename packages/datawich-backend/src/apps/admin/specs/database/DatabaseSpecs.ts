import { SpecFactory } from '@fangcha/router'
import { DatabaseApis } from '@web/datawich-common/admin-apis'
import { FangchaSession } from '@fangcha/session'
import { MyDatabase } from '../../../../services/MyDatabase'
import { DBSchemaHelper, TableDataHandler } from '@fangcha/datawich-sdk'

const factory = new SpecFactory('Database')

factory.addPreHandler(async (ctx, next) => {
  const session = ctx.session as FangchaSession
  session.assertVisitorIsAdmin()
  await next()
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

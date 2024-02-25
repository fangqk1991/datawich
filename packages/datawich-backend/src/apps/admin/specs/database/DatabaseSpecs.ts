import { SpecFactory } from '@fangcha/router'
import { DatabaseApis } from '@web/datawich-common/admin-apis'
import { FangchaSession } from '@fangcha/session'
import { MyDatabase } from '../../../../services/MyDatabase'
import { DBSchemaHelper } from '@fangcha/datawich-sdk'

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
  const tableName = ctx.params.modelKey
  ctx.body = await DBSchemaHelper.getTableSchema(MyDatabase.datawichDB, tableName)
})

export const DatabaseSpecs = factory.buildSpecs()

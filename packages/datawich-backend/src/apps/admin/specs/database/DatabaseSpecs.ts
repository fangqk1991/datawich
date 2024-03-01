import { SpecFactory } from '@fangcha/router'
import { FangchaSession } from '@fangcha/session'
import { _DBConnection } from '../../../../models/database/_DBConnection'
import { DatabaseHandler } from '../../../../services/DatabaseHandler'
import { DatabaseSpecHandler } from '../../../../services/DatabaseSpecHandler'
import { _DBTableExtras } from '../../../../models/database/_DBTableExtras'
import { SdkDatabaseApis } from '@fangcha/datawich-service'

const factory = new SpecFactory('Database')

factory.addPreHandler(async (ctx, next) => {
  const session = ctx.session as FangchaSession
  session.assertVisitorIsAdmin()
  await next()
})

factory.prepare(SdkDatabaseApis.ConnectionListGet, async (ctx) => {
  const searcher = new _DBConnection().fc_searcher(ctx.request.query)
  ctx.body = await searcher.queryJsonFeeds()
})

factory.prepare(SdkDatabaseApis.ConnectionCreate, async (ctx) => {
  const connection = await DatabaseHandler.generateConnection(ctx.request.body)
  ctx.body = connection.modelForClient()
})

factory.prepare(SdkDatabaseApis.ConnectionPing, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handle(async (connection) => {
    await new DatabaseHandler(connection).ping()
    ctx.status = 200
  })
})

factory.prepare(SdkDatabaseApis.ConnectionUpdate, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handle(async (connection) => {
    await new DatabaseHandler(connection).updateInfos(ctx.request.body)
    ctx.body = connection.modelForClient()
  })
})

factory.prepare(SdkDatabaseApis.ConnectionDelete, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handle(async (connection) => {
    await connection.deleteFromDB()
    ctx.status = 200
  })
})

factory.prepare(SdkDatabaseApis.ConnectionInfoGet, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handle(async (connection) => {
    ctx.body = connection.modelForClient()
  })
})

factory.prepare(SdkDatabaseApis.DatabaseSchemaGet, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handle(async (connection) => {
    ctx.body = await new DatabaseHandler(connection).getSchemaInfo()
  })
})

factory.prepare(SdkDatabaseApis.TableSchemaGet, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handleTable(async (table) => {
    ctx.body = table
  })
})

factory.prepare(SdkDatabaseApis.TableSchemaUpdate, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handleTable(async (table, connection) => {
    const extras = await _DBTableExtras.prepareExtras(connection.uid, table.tableId)
    await extras.updateInfos(ctx.request.body)
    ctx.body = extras.modelForClient()
  })
})

export const DatabaseSpecs = factory.buildSpecs()

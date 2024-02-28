import { SpecFactory } from '@fangcha/router'
import { DatabaseApis } from '@web/datawich-common/admin-apis'
import { FangchaSession } from '@fangcha/session'
import { TableDataHandler } from '@fangcha/datawich-sdk'
import { _DBConnection } from '../../../../models/database/_DBConnection'
import { DatabaseHandler } from '../../../../services/DatabaseHandler'
import { DatabaseSpecHandler } from '../../../../services/DatabaseSpecHandler'
import { _DBTableExtras } from '../../../../models/database/_DBTableExtras'

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
  await new DatabaseSpecHandler(ctx).handle(async (connection) => {
    await new DatabaseHandler(connection).ping()
    ctx.status = 200
  })
})

factory.prepare(DatabaseApis.ConnectionUpdate, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handle(async (connection) => {
    await new DatabaseHandler(connection).updateInfos(ctx.request.body)
    ctx.body = connection.modelForClient()
  })
})

factory.prepare(DatabaseApis.ConnectionDelete, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handle(async (connection) => {
    await connection.deleteFromDB()
    ctx.status = 200
  })
})

factory.prepare(DatabaseApis.ConnectionInfoGet, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handle(async (connection) => {
    ctx.body = connection.modelForClient()
  })
})

factory.prepare(DatabaseApis.DatabaseSchemaGet, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handle(async (connection) => {
    ctx.body = await new DatabaseHandler(connection).getSchemaInfo()
  })
})

factory.prepare(DatabaseApis.TableSchemaGet, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handleTable(async (table) => {
    ctx.body = table
  })
})

factory.prepare(DatabaseApis.TableSchemaUpdate, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handleTable(async (table, connection) => {
    const extras = await _DBTableExtras.prepareExtras(connection.uid, table.tableId)
    await extras.updateInfos(ctx.request.body)
    ctx.body = extras.modelForClient()
  })
})

factory.prepare(DatabaseApis.RecordPageDataGet, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handleTable(async (table, connection) => {
    const database = new DatabaseHandler(connection).database()
    ctx.body = await new TableDataHandler(database, table).getPageResult(ctx.request.query)
  })
})

factory.prepare(DatabaseApis.RecordCreate, async (ctx) => {
  const session = ctx.session as FangchaSession
  await new DatabaseSpecHandler(ctx).handleTable(async (table, connection) => {
    const database = new DatabaseHandler(connection).database()
    await new TableDataHandler(database, table).createRecord(ctx.request.body, session.curUserStr())
    ctx.status = 200
  })
})

factory.prepare(DatabaseApis.RecordInfoGet, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handleRecord(async (record) => {
    ctx.body = record
  })
})

factory.prepare(DatabaseApis.RecordUpdate, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handleRecord(async (record, table, connection) => {
    const database = new DatabaseHandler(connection).database()
    await new TableDataHandler(database, table).updateDataRecord(record, ctx.request.body)
    ctx.status = 200
  })
})

factory.prepare(DatabaseApis.RecordDelete, async (ctx) => {
  await new DatabaseSpecHandler(ctx).handleRecord(async (record, table, connection) => {
    const database = new DatabaseHandler(connection).database()
    await new TableDataHandler(database, table).deleteDataRecord(record)
    ctx.status = 200
  })
})

export const DatabaseSpecs = factory.buildSpecs()

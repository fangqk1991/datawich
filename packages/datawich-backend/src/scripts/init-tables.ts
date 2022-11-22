import * as fs from 'fs'
import { SafeTask } from '@fangcha/tools'
import { FCDatabase } from 'fc-sql'
import { DatawichConfig } from '../DatawichConfig'

SafeTask.run(async () => {
  const filePath = `${__dirname}/../../../../config/schemas.sql`
  const content = fs.readFileSync(filePath, 'utf8')

  const database = new FCDatabase()
  database.init({
    ...DatawichConfig.mysql.datawichDB,
    dialectOptions: {
      multipleStatements: true,
    },
  })
  await database.update(content)
})

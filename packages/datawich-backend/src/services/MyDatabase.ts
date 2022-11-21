import { FCDatabase } from 'fc-sql'
import { DBOptionsBuilder } from '@fangcha/tools/lib/database'
import { DatawichConfig } from '../DatawichConfig'

FCDatabase.instanceWithName('datawichDB').init(new DBOptionsBuilder(DatawichConfig.mysql.datawichDB).build())

export const MyDatabase = {
  datawichDB: FCDatabase.instanceWithName('datawichDB'),
}

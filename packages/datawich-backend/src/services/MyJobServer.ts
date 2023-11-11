import { JobServer } from '@fangcha/job'
import { MyDatabase } from './MyDatabase'

export const MyJobServer = new JobServer({
  database: MyDatabase.datawichDB,
  appName: 'Task',
})

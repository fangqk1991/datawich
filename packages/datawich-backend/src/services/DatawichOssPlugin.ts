import { MyDatabase } from './MyDatabase'
import { OssSdkPlugin } from '@fangcha/oss-service/lib/sdk'
import { DatawichConfig } from '../DatawichConfig'
import { DataAppRecordsXlsExportTask } from './tasks/DataAppRecordsXlsExportTask'

export const DatawichOssPlugin = OssSdkPlugin({
  database: MyDatabase.datawichDB,
  defaultOssOptions: DatawichConfig.ossOptions.Default,
  optionsMapper: {
    'fc-web-oss': DatawichConfig.ossOptions.Default,
  },
  taskMapper: {
    DataAppRecordsXlsExportTask: DataAppRecordsXlsExportTask,
  },
  downloadRootDir: DatawichConfig.datawichDownloadDir,
})

import { GeneralJobService } from '@fangcha/general-job'
import { MyDatabase } from './MyDatabase'

export class CommonJob extends GeneralJobService.getClass_CommonJob(MyDatabase.datawichDB) {
  public static AppName = 'Datawich'

  public constructor() {
    super()
  }
}

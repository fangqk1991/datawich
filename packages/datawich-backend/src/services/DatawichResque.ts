import { Resque, ResqueJob } from '@fangcha/resque'
import { DatawichConfig } from '../DatawichConfig'
import { CommonJob } from './CommonJob'

Resque.setRedisBackend(DatawichConfig.datawichResque)

export class DatawichResque {
  public static redis() {
    return Resque.redis()
  }

  public static async requestResourceHandleTask(taskKey: string) {
    const resqueJob = ResqueJob.generate('NormalPriorityQueue', 'ResourceHandleTask', { taskKey: taskKey })
    return CommonJob.saveResqueJobAndEnqueue(resqueJob)
  }
}

import __ModelMilestone from '../auto-build/__ModelMilestone'
import { ModelFullMetadata } from '@web/datawich-common/models'

export class _ModelMilestone extends __ModelMilestone {
  public constructor() {
    super()
  }

  public static async findMilestone(modelKey: string, tagName: string) {
    return (await _ModelMilestone.findOne({
      model_key: modelKey,
      tag_name: tagName,
    }))!
  }

  public static async checkMilestoneExists(modelKey: string, tagName: string) {
    const feed = await _ModelMilestone.findOne({
      model_key: modelKey,
      tag_name: tagName,
    })
    return !!feed
  }

  public getMetadata() {
    const data = JSON.parse(this.metadataStr) as ModelFullMetadata
    data.tagName = this.tagName
    return data
  }
}

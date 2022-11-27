import __CommonProfile from '../auto-build/__CommonProfile'
import { ProfileEvent } from '@web/datawich-common/models'

export class _CommonProfile extends __CommonProfile {
  public constructor() {
    super()
  }

  public static async makeProfile<T extends _CommonProfile>(
    this: { new (): T },
    user: string,
    event: ProfileEvent,
    target = ''
  ) {
    const clazz = this as any as typeof _CommonProfile
    let profile = await clazz.findOne({ user, event, target })
    if (!profile) {
      profile = new this()
      profile.user = user
      profile.event = event
      profile.target = target
      await profile.addToDB()
    }
    return profile
  }

  public profileData() {
    let data = {}
    try {
      data = JSON.parse(this.description) || {}
    } catch (e) {}
    return data
  }

  public async updateProfile(profile: {}) {
    this.fc_edit()
    this.description = JSON.stringify(profile)
    await this.updateToDB()
  }
}

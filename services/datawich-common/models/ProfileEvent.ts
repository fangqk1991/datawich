import { Descriptor } from '@fangcha/tools'

export enum ProfileEvent {
  UserModelSidebarApps = 'UserModelSidebarApps',
  UserModelAppDisplay = 'UserModelAppDisplay',
}

const values = [ProfileEvent.UserModelSidebarApps, ProfileEvent.UserModelAppDisplay]

const describe = (code: ProfileEvent) => {
  return code
}

export const ProfileEventDescriptor = new Descriptor(values, describe)

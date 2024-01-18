import { Descriptor } from '@fangcha/tools'

export enum ProfileEvent {
  UserModelSidebarApps = 'UserModelSidebarApps',
  UserModelAppDisplay = 'UserModelAppDisplay',
  UserModelDefaultPanel = 'UserModelDefaultPanel',
}

const values = [ProfileEvent.UserModelSidebarApps, ProfileEvent.UserModelAppDisplay, ProfileEvent.UserModelDefaultPanel]

const describe = (code: ProfileEvent) => {
  return code
}

export const ProfileEventDescriptor = new Descriptor(values, describe)

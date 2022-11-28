import { Descriptor } from '@fangcha/tools'

export enum AccessLevel {
  Protected = 'Protected',
  Public_OnlyFeature = 'Public_OnlyFeature',
  Public_Content = 'Public_Content',
}

const values = [AccessLevel.Protected, AccessLevel.Public_OnlyFeature, AccessLevel.Public_Content]

const describe = (code: AccessLevel) => {
  switch (code) {
    case AccessLevel.Protected:
      return '受保护的'
    case AccessLevel.Public_OnlyFeature:
      return '功能公开'
    case AccessLevel.Public_Content:
      return '完全公开'
  }
}

export const describeAccessLevelDetail = (code: AccessLevel) => {
  switch (code) {
    case AccessLevel.Protected:
      return '受保护的（模型相关组成员可用）'
    case AccessLevel.Public_OnlyFeature:
      return '功能公开（访客可以正常使用功能，但只能看到自己相关的内容）'
    case AccessLevel.Public_Content:
      return '完全公开（访客可以看到所有内容）'
  }
}

export const AccessLevelDescriptor = new Descriptor(values, describe)

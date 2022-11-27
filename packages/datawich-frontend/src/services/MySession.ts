import { Session } from '@fangcha/vue/basic'

interface SessionConfig {
  ossParams: {
    defaultBucketName: string
    defaultOssZone: string
  }
}

export const MySession = new Session<SessionConfig>()

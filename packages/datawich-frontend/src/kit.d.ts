import { AdminApp } from '@fangcha/vue/app-admin'

declare module 'vue/types/vue' {
  interface Vue {
    $app: AdminApp
    $whitespace: string // '　'
  }
}

declare global {
  interface Window {
    _fcApp: AdminApp
    _datawichApp: AgoraAdminApp
  }
}
